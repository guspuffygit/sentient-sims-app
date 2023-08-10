import {
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  ChatCompletionResponseMessageRoleEnum,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai';
import { useEffect, useState } from 'react';
import { MessageInputProps } from 'renderer/ChatBoxComponent';
import { defaultSystemPrompt } from 'main/sentient-sims/constants';

const defaultMessages = [
  {
    id: 'o120378hlkjh',
    index: 0,
    message: {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: defaultSystemPrompt,
    },
  },
  {
    id: 'lskjeow9127834',
    index: 1,
    message: {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: ``,
    },
  },
];

type GenerationResult = {
  request: CreateChatCompletionRequest;
  response: CreateChatCompletionResponse;
  err: any;
};

export default function useChatGeneration() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageInputProps[]>(() => {
    const storedState = localStorage.getItem('myState');
    return storedState !== null ? JSON.parse(storedState) : defaultMessages;
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

  const addMessage = (
    response:
      | ChatCompletionResponseMessage
      | ChatCompletionResponseMessage
      | undefined
  ) => {
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
      const request: CreateChatCompletionRequest = {
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

  const addNewMessage = (role: ChatCompletionResponseMessageRoleEnum) => {
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
  };
}
