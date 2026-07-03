import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import log from 'electron-log';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { ChatBoxComponent } from '../ChatBoxComponent';

const aiClient = new AIClient();

export type LLMExchangePanelProps = {
  label: string;
  initialMessages: MessageInputProps[];
  maxResponseTokens: number;
};

/**
 * Shows one full LLM request/response (e.g. "Scene Generation" or "Director Review") as an
 * editable, independently re-runnable mini chat, so the whole two-pass interaction can be
 * inspected and tweaked directly instead of only seeing the final combined result.
 */
export function LLMExchangePanel({ label, initialMessages, maxResponseTokens }: LLMExchangePanelProps) {
  const [messages, setMessages] = useState<MessageInputProps[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const handleMessageTextChange = (index: number, value: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], message: { ...updated[index].message, content: value } };
      return updated;
    });
  };

  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (messages.length === 0) return;

    setLoading(true);
    try {
      const requestMessages = messages.slice(0, -1).map((m) => m.message);
      const response = await aiClient.sentientSimsGenerate({ messages: requestMessages, maxResponseTokens });

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          message: { ...updated[lastIndex].message, role: 'assistant', content: response.text },
        };
        return updated;
      });
    } catch (e: any) {
      log.error('Unable to re-run LLM exchange', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {messages.map((message, index) => (
        <ChatBoxComponent
          key={message.id}
          index={index}
          message={message}
          handleMessageTextChange={handleMessageTextChange}
          handleDeleteMessage={handleDeleteMessage}
        />
      ))}
      <Button
        variant="outlined"
        onClick={() => {
          void handleSend();
        }}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Re-run this exchange'}
      </Button>
    </Box>
  );
}
