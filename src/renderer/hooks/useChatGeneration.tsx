/* eslint-disable no-plusplus */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  defaultCustomLLMPrompt,
  defaultSystemPrompt,
} from 'main/sentient-sims/constants';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { ChatCompletionMessageRole } from 'main/sentient-sims/models/ChatCompletionMessageRole';
import { generateUUID } from '@widgetbot/react-embed/dist/util';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { SentientMemory } from 'main/sentient-sims/models/SentientMemory';
import { GenerationResult } from 'main/sentient-sims/formatter/GenerationResult';
import { createPromptFormatter } from 'main/sentient-sims/formatter/PromptFormatterFactory';
import { PromptRequest } from 'main/sentient-sims/models/PromptRequest';
import { OpenAIPromptFormatter } from 'main/sentient-sims/formatter/OpenAIPromptFormatter';
import useSetting from './useSetting';

function defaultMessages(systemPrompt: string): MessageInputProps[] {
  return [
    {
      id: generateUUID(),
      message: {
        role: 'system',
        content: systemPrompt,
      },
    },
    {
      id: generateUUID(),
      message: {
        role: 'participants',
        content: '',
      },
    },
    {
      id: generateUUID(),
      message: {
        role: 'location',
        content: '',
      },
    },
    {
      id: generateUUID(),
      message: {
        role: 'user',
        content: '',
      },
    },
  ];
}

export interface ChatGeneration {
  messages: MessageInputProps[];
  loading: boolean;
  generateChat: () => Promise<void>;
  countTokens: () => void;
  handleMessageTextChange: (index: number, value: string) => void;
  resetMessages: () => void;
  deleteMessage: (index: number) => void;
  addNewMessage: (role: ChatCompletionMessageRole) => void;
  tokenCount: number;
  generateMultipleChat: (count: number) => Promise<string[]>;
  handleGenerationLoaded: Dispatch<SetStateAction<() => void>>;
}

export default function useChatGeneration(): ChatGeneration {
  const customLLMEnabled = useSetting(SettingsEnum.CUSTOM_LLM_ENABLED, false);
  const [loading, setLoading] = useState(false);
  const [generationLoadedCallback, setGenerationLoadedCallback] = useState<
    () => void
  >(() => {});
  const [messages, setMessages] = useState<MessageInputProps[]>(
    defaultMessages(defaultSystemPrompt)
  );
  const [tokenCount, setTokenCount] = useState(0);

  const resetMessages = useCallback(() => {
    if (customLLMEnabled.value) {
      setMessages(defaultMessages(defaultCustomLLMPrompt));
    } else {
      setMessages(defaultMessages(defaultSystemPrompt));
    }
  }, [customLLMEnabled.value]);

  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  useEffect(() => {
    const removeListener = window.electron.onChatGeneration(
      (_event: any, result: GenerationResult) => {
        const updatedMessages: MessageInputProps[] = [];

        updatedMessages.push({
          id: generateUUID(),
          message: {
            role: 'system',
            content: result.systemPrompt,
          },
        });
        updatedMessages.push({
          id: generateUUID(),
          message: {
            role: 'participants',
            content: result.prompt.participants,
          },
        });
        updatedMessages.push({
          id: generateUUID(),
          message: {
            role: 'location',
            content: result.prompt.location,
          },
        });
        result.prompt.memories.forEach((memory) => {
          if (memory.pre_action) {
            updatedMessages.push({
              id: generateUUID(),
              message: {
                role: 'user',
                content: memory.pre_action.trim(),
              },
            });
          }
          if (memory.content) {
            updatedMessages.push({
              id: generateUUID(),
              message: {
                role: 'assistant',
                content: memory.content.trim(),
              },
            });
          }
          if (memory.observation) {
            updatedMessages.push({
              id: generateUUID(),
              message: {
                role: 'user',
                content: memory.observation.trim(),
              },
            });
          }
        });
        if (result.prompt.pre_action) {
          updatedMessages.push({
            id: generateUUID(),
            message: {
              role: 'user',
              content: result.prompt.pre_action.trim(),
            },
          });
        }
        if (result.output && result.output.trim() !== '') {
          updatedMessages.push({
            id: generateUUID(),
            message: {
              role: 'assistant',
              content: result.output.trim(),
            },
          });
        }

        setMessages(updatedMessages);
        generationLoadedCallback();
      }
    );
    return () => {
      removeListener();
    };
  }, [customLLMEnabled.value, generationLoadedCallback]);

  const addMessage = (response: ChatCompletionMessage | undefined) => {
    if (response) {
      const updatedMessages = [
        ...messages,
        {
          message: {
            role: response.role,
            content: response.content,
          },
        },
      ];
      setMessages(updatedMessages);
    }
  };

  const getPromptRequest = useCallback(() => {
    const memories: SentientMemory[] = [];
    for (let i = 3; i < messages.length; i++) {
      if (messages[i].message.role === 'user') {
        memories.push({
          pre_action: messages[i].message.content as string,
        });
      } else {
        memories.push({
          content: messages[i].message.content as string,
        });
      }
    }
    return {
      systemPrompt: messages[0].message.content as string,
      participants: messages[1].message.content as string,
      location: messages[2].message.content as string,
      memories,
    };
  }, [messages]);

  const countTokens = () => {
    const promptRequest: PromptRequest = getPromptRequest();
    const promptFormatter = createPromptFormatter(customLLMEnabled.value);

    let length = 0;
    if (promptFormatter instanceof OpenAIPromptFormatter) {
      const prompt = promptRequest.pre_action
        ? promptFormatter.formatActionPrompt(promptRequest)
        : promptFormatter.formatPrompt(promptRequest);
      length = prompt.reduce(
        (accumulator, value) => accumulator + value.tokens,
        0
      );
    } else {
      const prompt = promptRequest.pre_action
        ? promptFormatter.formatActionPrompt(promptRequest)
        : promptFormatter.formatPrompt(promptRequest);
      length = promptFormatter.encode(prompt).length;
    }
    setTokenCount(length);
  };

  const generateChat = async () => {
    setLoading(true);
    try {
      const request = getPromptRequest();

      await fetch('http://localhost:25148/ai/v2/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
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
    [messages]
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
    });
  };

  async function generate(request: PromptRequest): Promise<string> {
    const response = await fetch('http://localhost:25148/ai/v2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const { text } = await response.json();
    return text;
  }

  const generateMultipleChat = async (count: number) => {
    let results: string[] = [];

    setLoading(true);
    try {
      const request = getPromptRequest();

      const generations = [];
      for (let i = 0; i < count; i++) {
        generations.push(generate(request));
      }

      results = await Promise.all(generations);
    } catch (e: any) {
      log.error(`Unabled to generateMultipleChat`, e);
    } finally {
      setLoading(false);
    }

    return results;
  };

  return {
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    tokenCount,
    countTokens,
    generateMultipleChat,
    handleGenerationLoaded: setGenerationLoadedCallback,
  };
}
