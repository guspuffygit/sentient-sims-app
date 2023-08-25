import { useEffect, useState } from 'react';
import { MessageInputProps } from 'renderer/ChatBoxComponent';
import { defaultSystemPrompt } from 'main/sentient-sims/constants';
import {
  ChatCompletion,
  ChatCompletionMessage,
  CompletionCreateParams,
} from 'openai/resources/chat';
import { ChatCompletionMessageRole } from 'main/sentient-sims/models/ChatCompletionMessageRole';
import { encode } from '@nem035/gpt-3-encoder';

const defaultSystemMessage: ChatCompletionMessage = {
  role: 'system',
  content: defaultSystemPrompt,
};

const defaultUserMessage: ChatCompletionMessage = {
  role: 'user',
  content: ``,
};

const defaultMessages: MessageInputProps[] = [
  {
    id: 'o120378hlkjh',
    index: 0,
    message: defaultSystemMessage,
  },
  {
    id: 'lskjeow9127834',
    index: 1,
    message: defaultUserMessage,
  },
];

type GenerationResult = {
  request: CompletionCreateParams;
  response: ChatCompletion;
  err: any;
};

export default function useChatGeneration() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageInputProps[]>(() => {
    const storedState = localStorage.getItem('myState');
    return storedState !== null ? JSON.parse(storedState) : defaultMessages;
  });

  let tokenCount = 0;
  messages?.forEach((message) => {
    if (message?.message?.content) {
      tokenCount += encode(message.message.content).length;
    }
  });

  useEffect(() => {
    window.electron.onChatGeneration(
      (_event: any, result: GenerationResult) => {
        const updatedMessages = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < result.request.messages.length; i++) {
          updatedMessages.push({
            index: i,
            message: {
              role: result.request.messages[i].role,
              content: result.request.messages[i].content,
            },
          });
        }
        if (result.response.choices?.[0]?.message) {
          updatedMessages.push({
            index: updatedMessages.length,
            message: {
              role: result.response.choices[0].message?.role,
              content: result.response.choices[0].message?.content,
            },
          });
        }
        setMessages(updatedMessages);
      }
    );
  }, []);

  const addMessage = (response: ChatCompletionMessage | undefined) => {
    if (response) {
      const updatedMessages = [
        ...messages,
        {
          index: messages.length,
          message: {
            role: response.role,
            content: response.content,
          },
        },
      ];
      setMessages(updatedMessages);
    }
  };

  const generateChat = async () => {
    setLoading(true);
    try {
      const request: CompletionCreateParams = {
        model: 'gpt-3.5-turbo',
        messages: messages.map((message) => message.message),
      };

      const response = await fetch('http://localhost:25148/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const result: GenerationResult = await response.json();
      if (result.response?.choices?.[0]?.message) {
        addMessage(result.response.choices[0].message);
      }
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

  const resetMessages = () => {
    setMessages(defaultMessages);
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
