import { Box, Button, CardActions } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import {
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  ChatCompletionResponseMessageRoleEnum,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai';
import { useEffect, useRef, useState } from 'react';
import { ChatBoxComponent, MessageInputProps } from './ChatBoxComponent';

const defaultMessages = [
  {
    id: 'o120378hlkjh',
    index: 0,
    message: {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: window.electron.systemPrompt,
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

export default function ChatPage() {
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

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      const request: CreateChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: messages.map((message) => message.message),
      };

      const response = await fetch('http://localhost:25148/generate', {
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

  const reset = () => {
    setMessages(defaultMessages);
  };

  const handleDeleteMessage = (index: number) => {
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Box height={1000} overflow="auto">
        {messages.map((message) => (
          <ChatBoxComponent
            message={message}
            handleMessageTextChange={handleMessageTextChange}
            handleDeleteMessage={handleDeleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        {loading ? (
          <CircularProgress disableShrink />
        ) : (
          <>
            <div>
              <Button
                type="submit"
                onClick={handleSendMessage}
                color="primary"
                endIcon={<SendIcon />}
              >
                Send
              </Button>
              <Button
                onClick={() =>
                  addNewMessage(ChatCompletionResponseMessageRoleEnum.User)
                }
                color="primary"
                endIcon={<AddCircleIcon />}
              >
                Add User
              </Button>
              <Button
                onClick={() =>
                  addNewMessage(ChatCompletionResponseMessageRoleEnum.Assistant)
                }
                color="primary"
                endIcon={<AddCircleIcon />}
              >
                Add Assistant
              </Button>
            </div>
            <div>
              <Button onClick={reset} color="primary">
                Reset
              </Button>
            </div>
          </>
        )}
      </CardActions>
      {/* <Typography>{countMessagesTokens(messages)} tokens</Typography> */}
    </>
  );
}
