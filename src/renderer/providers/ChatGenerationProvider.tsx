import { createContext, ReactNode, use } from 'react';
import useChatGeneration, { ChatGeneration } from 'renderer/hooks/useChatGeneration';

export const ChatGenerationContext = createContext<ChatGeneration | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

// Custom hook to use the ChatGenerationContext
export function useChatGenerationContext() {
  const context = use(ChatGenerationContext);

  if (!context) {
    throw new Error('useChatGenerationContext must be used within a ChatProvider');
  }
  return context;
}

export function ChatGenerationProvider({ children }: ChatProviderProps) {
  const chatGeneration = useChatGeneration();

  return <ChatGenerationContext value={chatGeneration}>{children}</ChatGenerationContext>;
}
