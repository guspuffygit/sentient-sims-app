import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { defaultMythoMaxSystemPrompt, defaultSystemPrompt } from 'main/sentient-sims/constants';
import { ChatCompletionMessageRole } from 'main/sentient-sims/models/ChatCompletionMessageRole';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { InteractionEventResult } from 'main/sentient-sims/models/InteractionEventResult';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { OpenAIMessage } from 'main/sentient-sims/models/OpenAIMessage';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { InteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { DirectedSceneRequest } from 'main/sentient-sims/models/DirectedSceneRequest';
import { useVoiceTestPlayback, VoiceTestLine } from 'renderer/voice/useVoiceTestPlayback';
import useSetting from './useSetting';

const aiClient = new AIClient();

function defaultMessages(systemPrompt: string): MessageInputProps[] {
  return [
    {
      id: crypto.randomUUID(),
      message: {
        role: 'system',
        content: systemPrompt,
        tokens: 0,
      },
    },
    {
      id: crypto.randomUUID(),
      message: {
        role: 'user',
        content: '',
        tokens: 0,
      },
    },
  ];
}

function defaultMessagesForApiType(apiType: ApiType): MessageInputProps[] {
  return apiType === ApiType.OpenAI
    ? defaultMessages(defaultSystemPrompt)
    : defaultMessages(defaultMythoMaxSystemPrompt);
}

export type ChatExchange = {
  id: string;
  label: string;
  initialMessages: MessageInputProps[];
};

export interface ChatGeneration {
  messages: MessageInputProps[];
  input?: string | null;
  interactionName?: string;
  loading: boolean;
  generateChat: () => Promise<void>;
  countTokens: () => void;
  handleMessageTextChange: (index: number, value: string) => void;
  resetMessages: () => void;
  deleteMessage: (index: number) => void;
  addNewMessage: (role: ChatCompletionMessageRole) => void;
  generateMultipleChat: (count: number) => Promise<string[]>;
  generateScenario: (event: InteractionEvent) => Promise<void>;
  generateDirectedScene: (request: DirectedSceneRequest) => Promise<void>;
  continueDirectedScene: () => Promise<void>;
  canContinueScene: boolean;
  handleGenerationLoaded: Dispatch<SetStateAction<() => void>>;
  maxResponseTokensState: [number, Dispatch<SetStateAction<number>>];
  voiceTestModeState: [boolean, Dispatch<SetStateAction<boolean>>];
  voiceLinesByMessageId: Record<string, VoiceTestLine[]>;
  exchanges?: ChatExchange[];
}

export default function useChatGeneration(): ChatGeneration {
  const apiType = useSetting(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
  const [loading, setLoading] = useState(false);
  const [generationLoadedCallback, setGenerationLoadedCallback] = useState<() => void>(() => {});
  const [messages, setMessages] = useState<MessageInputProps[]>(() => defaultMessagesForApiType(apiType.value));
  const [input, setInput] = useState<string | undefined | null>();
  const [interactionName, setInteractionName] = useState<string | undefined>();
  const [maxResponseTokens, setMaxResponseTokens] = useState(90);
  const [prevApiType, setPrevApiType] = useState(apiType.value);
  const [voiceTestMode, setVoiceTestMode] = useState(false);
  const [voiceLinesByMessageId, setVoiceLinesByMessageId] = useState<Record<string, VoiceTestLine[]>>({});
  const [exchanges, setExchanges] = useState<ChatExchange[] | undefined>(undefined);
  const [lastDirectedScene, setLastDirectedScene] = useState<DirectedSceneRequest | undefined>(undefined);
  const { fetchVoiceLines } = useVoiceTestPlayback();

  if (prevApiType !== apiType.value) {
    setPrevApiType(apiType.value);
    setMessages(defaultMessagesForApiType(apiType.value));
  }

  const resetMessages = useCallback(() => {
    setMessages(defaultMessagesForApiType(apiType.value));
  }, [apiType.value]);

  useEffect(() => {
    const removeListener = window.electron.onChatGeneration((_event: any, result: InteractionEventResult) => {
      const updatedMessages: MessageInputProps[] = [];

      if (result.request?.messages) {
        result.request.messages.forEach((message) => {
          updatedMessages.push({
            id: crypto.randomUUID(),
            message,
          });
        });

        if (result.text) {
          if (updatedMessages[updatedMessages.length - 1].message.role === 'assistant') {
            updatedMessages[updatedMessages.length - 1].message.content += ` ${result.text}`;
          } else {
            updatedMessages.push({
              id: crypto.randomUUID(),
              message: {
                role: 'assistant',
                content: result.text,
                tokens: 0,
              },
            });
          }
        }

        setMessages(updatedMessages);

        if (result.exchanges && result.exchanges.length > 0) {
          setExchanges(
            result.exchanges.map((exchange) => ({
              id: crypto.randomUUID(),
              label: exchange.label,
              initialMessages: [
                ...exchange.request.messages.map((message) => ({
                  id: crypto.randomUUID(),
                  message,
                })),
                {
                  id: crypto.randomUUID(),
                  message: { role: 'assistant' as const, content: exchange.responseText, tokens: 0 },
                },
              ],
            })),
          );
        }

        const isDirectedScene = Boolean(result.exchanges && result.exchanges.length > 0);
        if ((voiceTestMode || isDirectedScene) && result.text) {
          const assistantMessage = updatedMessages[updatedMessages.length - 1];
          if (assistantMessage.id) {
            const { id: assistantMessageId } = assistantMessage;
            void fetchVoiceLines(assistantMessage.message.content, (lines) => {
              setVoiceLinesByMessageId((prev) => ({ ...prev, [assistantMessageId]: lines }));
            });
          }
        }

        if (result.input) {
          try {
            setInput(JSON.stringify(result.input, null, 2));
          } catch (e: any) {
            log.error(`Unable to stringify input`, e);
          }
          const inputWithName = result.input as { interaction_name?: string } | undefined;
          setInteractionName(inputWithName?.interaction_name ?? undefined);
        } else {
          setInteractionName(undefined);
        }
        generationLoadedCallback();
      }
    });
    return () => {
      removeListener();
    };
  }, [apiType.value, generationLoadedCallback, voiceTestMode, fetchVoiceLines]);

  const addMessage = (message: OpenAIMessage) => {
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: crypto.randomUUID(),
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
      maxResponseTokens,
    };
  }, [maxResponseTokens, messages]);

  const countTokens = () => {
    // TODO: Reimplement this
  };

  const generateScenario = async (event: InteractionEvent) => {
    setLoading(true);
    try {
      await aiClient.interactionEvent(event);
    } catch (e: any) {
      log.error(`Unable to generateScenario`, e);
    } finally {
      setLoading(false);
    }
  };

  const generateDirectedScene = async (request: DirectedSceneRequest) => {
    setLoading(true);
    try {
      setLastDirectedScene(request);
      await aiClient.directedScene(request);
    } catch (e: any) {
      log.error(`Unable to generateDirectedScene`, e);
    } finally {
      setLoading(false);
    }
  };

  const continueDirectedScene = async () => {
    if (!lastDirectedScene) return;
    // Same scenario, fresh event id — memory from the previous scene carries the story forward,
    // and continueScene tells the pipeline to advance the conversation instead of replaying the action
    await generateDirectedScene({
      ...lastDirectedScene,
      continueScene: true,
      event: { ...lastDirectedScene.event, event_id: crypto.randomUUID() },
    });
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
    interactionName,
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    countTokens,
    generateMultipleChat,
    generateScenario,
    generateDirectedScene,
    continueDirectedScene,
    canContinueScene: Boolean(lastDirectedScene),
    handleGenerationLoaded: setGenerationLoadedCallback,
    maxResponseTokensState: [maxResponseTokens, setMaxResponseTokens],
    voiceTestModeState: [voiceTestMode, setVoiceTestMode],
    voiceLinesByMessageId,
    exchanges,
  };
}
