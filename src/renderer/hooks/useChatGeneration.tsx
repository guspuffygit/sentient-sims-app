/* eslint-disable no-plusplus */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  defaultMythoMaxSystemPrompt,
  defaultSystemPrompt,
} from 'main/sentient-sims/constants';
import { ChatCompletionMessageRole } from 'main/sentient-sims/models/ChatCompletionMessageRole';
import { generateUUID } from '@widgetbot/react-embed/dist/util';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { InteractionEventResult } from 'main/sentient-sims/models/InteractionEventResult';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { OpenAIMessage } from 'main/sentient-sims/models/OpenAIMessage';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import useSetting from './useSetting';

const aiClient = new AIClient();

function defaultMessages(systemPrompt: string): MessageInputProps[] {
  return [
    {
      id: generateUUID(),
      message: {
        role: 'system',
        content: systemPrompt,
        tokens: 0,
      },
    },
    {
      id: generateUUID(),
      message: {
        role: 'user',
        content: '',
        tokens: 0,
      },
    },
  ];
}

export interface ChatGeneration {
  messages: MessageInputProps[];
  input?: string | null;
  loading: boolean;
  generateChat: () => Promise<void>;
  countTokens: () => void;
  handleMessageTextChange: (index: number, value: string) => void;
  resetMessages: () => void;
  deleteMessage: (index: number) => void;
  addNewMessage: (role: ChatCompletionMessageRole) => void;
  generateMultipleChat: (count: number) => Promise<string[]>;
  handleGenerationLoaded: Dispatch<SetStateAction<() => void>>;
}

export default function useChatGeneration(): ChatGeneration {
  const apiType = useSetting(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
  const [loading, setLoading] = useState(false);
  const [generationLoadedCallback, setGenerationLoadedCallback] = useState<
    () => void
  >(() => {});
  const [messages, setMessages] = useState<MessageInputProps[]>(
    defaultMessages(defaultSystemPrompt),
  );
  const [input, setInput] = useState<string | undefined | null>();

  const resetMessages = useCallback(() => {
    if (apiType.value === ApiType.OpenAI) {
      setMessages(defaultMessages(defaultSystemPrompt));
    } else {
      setMessages(defaultMessages(defaultMythoMaxSystemPrompt));
    }
  }, [apiType.value]);

  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  useEffect(() => {
    const removeListener = window.electron.onChatGeneration(
      (_event: any, result: InteractionEventResult) => {
        const updatedMessages: MessageInputProps[] = [];

        if (result.request?.messages) {
          result.request.messages.forEach((message) => {
            updatedMessages.push({
              id: generateUUID(),
              message,
            });
          });

          if (result.text) {
            if (
              updatedMessages[updatedMessages.length - 1].message.role ===
              'assistant'
            ) {
              updatedMessages[updatedMessages.length - 1].message.content +=
                ` ${result.text}`;
            } else {
              updatedMessages.push({
                id: generateUUID(),
                message: {
                  role: 'assistant',
                  content: result.text,
                  tokens: 0,
                },
              });
            }
          }

          setMessages(updatedMessages);
          if (result.input) {
            try {
              setInput(JSON.stringify(result.input, null, 2));
            } catch (e: any) {
              log.error(`Unable to stringify input`, e);
            }
          }
          generationLoadedCallback();
        }
      },
    );
    return () => {
      removeListener();
    };
  }, [apiType.value, generationLoadedCallback]);

  const addMessage = (message: OpenAIMessage) => {
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: generateUUID(),
        message,
      },
    ]);
  };

  const getPromptRequest = useCallback((): OpenAICompatibleRequest => {
    const requestMessages: OpenAIMessage[] = messages.map((message) => {
      return {
        role: message.message.role,
        tokens: 0,
        content: message.message.content,
      };
    });
    return {
      messages: requestMessages,
      maxResponseTokens: 90,
    };
  }, [messages]);

  const countTokens = () => {
    // TODO: Reimplement this
  };

  const generateChat = async () => {
    setLoading(true);
    try {
      const request = getPromptRequest();
      await aiClient.sentientSimsGenerate(request);
    } catch (e: any) {
      log.error(`Unabled to generateChat`, e);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageTextChange = useCallback(
    (index: number, value: string) => {
      const updatedMessages = [...messages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        message: {
          ...updatedMessages[index].message,
          content: value,
        },
      };
      setMessages(updatedMessages);
    },
    [messages],
  );

  const deleteMessage = (index: number) => {
    const updatedMessages = [...messages];
    updatedMessages.splice(index, 1);
    setMessages(updatedMessages);
  };

  const addNewMessage = (role: ChatCompletionMessageRole) => {
    addMessage({
      role,
      content: '',
      tokens: 0,
    });
  };

  const generateMultipleChat = async (count: number) => {
    let results: string[] = [];

    setLoading(true);
    try {
      const request = getPromptRequest();

      const generations = [];
      for (let i = 0; i < count; i++) {
        generations.push(aiClient.sentientSimsGenerate(request));
      }

      const responses = await Promise.all(generations);
      results = responses.map((response) => response.text);
    } catch (e: any) {
      log.error(`Unabled to generateMultipleChat`, e);
    } finally {
      setLoading(false);
    }

    return results;
  };

  return {
    input,
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    countTokens,
    generateMultipleChat,
    handleGenerationLoaded: setGenerationLoadedCallback,
  };
}
