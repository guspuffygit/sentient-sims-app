/* eslint-disable no-plusplus */
import { useCallback, useEffect, useState } from 'react';
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
import {
  removeLastParagraph,
  trimIncompleteSentence,
} from 'main/sentient-sims/formatter/PromptFormatter';
import { createPromptFormatter } from 'main/sentient-sims/formatter/PromptFormatterFactory';
import { PromptRequest } from 'main/sentient-sims/models/PromptRequest';
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

export default function useChatGeneration(handleGenerationLoaded: () => void) {
  const customLLMEnabled = useSetting(SettingsEnum.CUSTOM_LLM_ENABLED, false);
  const [loading, setLoading] = useState(false);
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
          if (memory.action) {
            updatedMessages.push({
              id: generateUUID(),
              message: {
                role: 'user',
                content: memory.action.trim(),
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
        const actions: string[] = [];

        if (result.prompt.pre_action) {
          actions.push(result.prompt.pre_action.trim());
        }
        if (result.prompt.action) {
          actions.push(result.prompt.action.trim());
        }
        if (actions.length > 0) {
          updatedMessages.push({
            id: generateUUID(),
            message: {
              role: 'user',
              content: actions.join(' '),
            },
          });
        }

        if (result.output && result.output.trim() !== '') {
          let content = removeLastParagraph(result.output.trim());
          content = trimIncompleteSentence(content.trim());
          updatedMessages.push({
            id: generateUUID(),
            message: {
              role: 'assistant',
              content: content.trim(),
            },
          });
        }

        setMessages(updatedMessages);
        handleGenerationLoaded();
      }
    );
    return () => {
      removeListener();
    };
  }, [customLLMEnabled.value, handleGenerationLoaded]);

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
          action: messages[i].message.content as string,
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

  useEffect(() => {
    const promptRequest: PromptRequest = getPromptRequest();
    const promptFormatter = createPromptFormatter(customLLMEnabled.value);
    const prompt = promptFormatter.formatPrompt(promptRequest);
    const { length } = promptFormatter.encode(
      (customLLMEnabled.value ? '' : promptRequest.systemPrompt) + prompt
    );
    setTokenCount(length);
  }, [customLLMEnabled.value, getPromptRequest]);

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

  const handleMessageTextChange = (index: number, value: string) => {
    if (index in messages) {
      const updatedMessages = [...messages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        message: {
          ...updatedMessages[index].message,
          content: value,
        },
      };
      setMessages(updatedMessages);
    }
  };

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

  return {
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    tokenCount,
  };
}
