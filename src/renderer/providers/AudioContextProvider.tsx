import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { sceneChunkGapMs, sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import { useElevenLabsTTS } from 'renderer/voice/useElevenLabsTTS';
import { useSentientSimsTTS } from 'renderer/voice/useSentientSimsTTS';
import { pacedDelay, setClockState, waitWhileUserPaused } from 'renderer/voice/playbackClock';
import { insertScene } from 'renderer/voice/sceneQueue';
import { useAISettings } from './AISettingsProvider';

interface TTSAudioContextType {
  // voiceId pins a specific cast voice (an ElevenLabs voice id or a Kokoro blend like
  // 'af_heart+af_sky') instead of the settings default — used by per-sim voice test buttons
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  isWebGPUSupported: boolean | null;
  isPlaying: boolean | undefined;
  error: string | undefined;
}

const TTSAudioContext = createContext<TTSAudioContextType | undefined>(undefined);

interface AudioContextProviderProps {
  children: ReactNode;
}

async function checkWebGPU(): Promise<boolean> {
  if (!('gpu' in navigator)) {
    log.warn('WebGPU is not supported in this environment.');
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      log.warn('WebGPU adapter is not available.');
      return false;
    }
    return true;
  } catch (error) {
    log.error('Error while checking WebGPU support:', error);
    return false;
  }
}

export function AudioContextProvider({ children }: AudioContextProviderProps) {
  const aiSettings = useAISettings();
  const sentientSimsTTS = useSentientSimsTTS();
  const elevenLabsTTS = useElevenLabsTTS();
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);

  const tts = useMemo(() => {
    if (aiSettings.ttsApiType === ApiType.SentientSimsAI) {
      return sentientSimsTTS;
    }
    if (aiSettings.ttsApiType === ApiType.ElevenLabs) {
      return elevenLabsTTS;
    }
  }, [aiSettings.ttsApiType, elevenLabsTTS, sentientSimsTTS]);

  useEffect(() => {
    async function checkSupport() {
      const supported = await checkWebGPU();
      setIsWebGPUSupported(supported);
    }

    void checkSupport();
  }, []);

  // V-1: the game clock drives playback (user pause holds audio + the scene queue;
  // speed 2/3 paces faster). Mod-initiated pauses are filtered out in setClockState.
  useEffect(() => {
    const remove = window.electron.onClockState(
      (_event: unknown, state: { speed: string; paused: boolean; paused_by?: 'user' | 'mod' | null }) => {
        setClockState(state);
      },
    );
    return () => {
      remove();
    };
  }, []);

  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      if (!text.trim()) return;

      if (!aiSettings.ttsEnabled) return;

      // A pinned voice has to go through the per-line path; plain speak() always
      // uses the settings default voice
      if (voiceId && tts?.speakLines) {
        await tts.speakLines([{ speaker: 'Voice test', text, voiceId }]);
        return;
      }
      await tts?.speak(text);
    },
    [aiSettings.ttsEnabled, tts],
  );

  // One scene plays at a time; a few more may wait so back-to-back autonomous scenes all
  // play in order. Beyond that, scenes are dropped so audio never piles up far behind
  // gameplay. Paced scenes stream each line to the game as it starts playing (the
  // whole-block in-game subtitle was suppressed on their behalf); the preamble (the
  // scene's driving action) heads each line's subtitle section
  const maxQueuedScenes = 3;
  type QueuedScene = {
    lines: DialogueLine[];
    paced: boolean;
    // Main-process dispatch order and priority flag: insertScene keeps the queue in
    // rank-then-seq order so scenes air in the order they were requested
    seq: number;
    priority: boolean;
    preamble?: string;
    pacedText?: string;
    // Which conversation this round belongs to (see ScenePlaybackRegistry). A scene the
    // game ends partway is found by this id, in the queue and mid-playback.
    sceneId?: string;
    participantSimIds?: string[];
  };
  const sceneQueueRef = useRef<QueuedScene[]>([]);
  const drainingRef = useRef(false);
  // The round being spoken right now, and the conversations the game has ended.
  // 'soft' lets the line in progress finish; 'hard' cuts it off.
  const currentSceneRef = useRef<QueuedScene | undefined>(undefined);
  const stoppedScenesRef = useRef(new Map<string, 'soft' | 'hard'>());

  // A dropped paced scene will never stream its lines, so tell the main process to
  // un-suppress its in-game subtitle block before the memory arrives from the mod
  const reportDroppedScene = useCallback((scene: { paced: boolean; pacedText?: string }) => {
    if (scene.paced && scene.pacedText) {
      window.electron.notifySceneDropped(scene.pacedText);
    }
  }, []);

  const stop = useCallback(() => {
    // Whatever is playing is being pre-empted, so the conversation it belongs to is
    // over: mark it stopped, and its round reports back as cut short
    const current = currentSceneRef.current;
    if (current?.sceneId) {
      stoppedScenesRef.current.set(current.sceneId, 'hard');
    }
    sceneQueueRef.current.splice(0).forEach(reportDroppedScene);
    tts?.stop();
  }, [tts, reportDroppedScene]);

  const speakDialogueLines = useCallback(
    async (scene: QueuedScene) => {
      const { lines, paced, preamble, sceneId } = scene;
      if (lines.length === 0) return;

      const notifyLineShown = paced
        ? (line: DialogueLine, voiced: boolean) => {
            // A skipSceneLine line's subtitle was already sent directly by the main
            // process (e.g. a Twitch question) — reporting it again would double it
            if (line.skipSceneLine) return;
            window.electron.notifySceneLineShown({
              speaker: line.speaker,
              text: line.text,
              preamble,
              voiced,
              // Who is speaking and who they are with, so the game can end the
              // conversation when they stop being together
              simId: line.simId,
              sceneId,
              participantSimIds: scene.participantSimIds,
              continues: line.continues,
            });
          }
        : undefined;
      // The mod moves the speaker's mouth from line start to line end (and through the
      // gap when more of the same line follows)
      const notifyLineEnded = paced
        ? (line: DialogueLine) => {
            if (line.skipSceneLine) return;
            window.electron.notifySceneLineEnded({
              speaker: line.speaker,
              text: line.text,
              sceneId,
              continues: line.continues,
            });
          }
        : undefined;
      // False once the game has ended this conversation: the line playing right now
      // finishes, and nothing after it starts
      const shouldContinue = () => !sceneId || !stoppedScenesRef.current.has(sceneId);

      const uniqueSpeakers = new Set(lines.map((line) => line.speaker));
      const hasCastVoices = lines.some((line) => line.voiceId);

      if (aiSettings.ttsEnabled && (uniqueSpeakers.size > 1 || hasCastVoices) && tts?.speakLines) {
        await tts.speakLines(lines, notifyLineShown, notifyLineEnded, shouldContinue);
        return;
      }

      if (!notifyLineShown) {
        if (aiSettings.ttsEnabled) {
          await speak(lines.map((line) => line.text).join(' '));
        }
        return;
      }

      // Paced scene without a per-line TTS path (TTS disabled or single voice): the
      // in-game subtitles still arrive one line at a time, each held for its audio's
      // duration or, with TTS off, long enough to read
      for (let i = 0; i < lines.length; i += 1) {
        // tts.stop() cannot interrupt this loop (it has no session to bump), so the
        // end of the conversation has to be checked here too
        if (!shouldContinue()) break;
        await waitWhileUserPaused();
        notifyLineShown(lines[i], aiSettings.ttsEnabled);
        try {
          if (aiSettings.ttsEnabled) {
            await speak(lines[i].text);
          } else {
            await pacedDelay(sceneLineReadingHoldMs(lines[i].text));
          }
        } finally {
          notifyLineEnded?.(lines[i]);
        }
        if (i < lines.length - 1) {
          await pacedDelay(lines[i].continues ? sceneChunkGapMs : sceneLineGapMs);
        }
      }
    },
    [aiSettings.ttsEnabled, tts, speak],
  );

  const drainSceneQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (sceneQueueRef.current.length > 0) {
        // V-1: a user pause holds the whole queue, not just the current line
        await waitWhileUserPaused();
        const scene = sceneQueueRef.current.shift();
        if (!scene) continue;
        currentSceneRef.current = scene;
        try {
          await speakDialogueLines(scene);
        } finally {
          currentSceneRef.current = undefined;
          if (scene.paced && scene.sceneId) {
            // completed false = the conversation was cut short, so the pipeline stops
            // generating rounds for it
            const stopped = stoppedScenesRef.current.has(scene.sceneId);
            window.electron.notifyScenePlaybackEnded({ sceneId: scene.sceneId, completed: !stopped });
          }
        }
      }
    } finally {
      drainingRef.current = false;
    }
  }, [speakDialogueLines]);

  useEffect(() => {
    const removeListener = window.electron.onVoice(
      (
        _event: any,
        lines: DialogueLine[],
        options?: {
          seq?: number;
          paced?: boolean;
          preamble?: string;
          pacedText?: string;
          priority?: boolean;
          sceneId?: string;
          participantSimIds?: string[];
        },
      ) => {
        const scene: QueuedScene = {
          lines,
          paced: options?.paced ?? false,
          // A dispatch without a seq (shouldn't happen) behaves like a plain push
          seq: options?.seq ?? Number.MAX_SAFE_INTEGER,
          priority: options?.priority ?? false,
          preamble: options?.preamble,
          pacedText: options?.pacedText,
          sceneId: options?.sceneId,
          participantSimIds: options?.participantSimIds,
        };
        if (scene.sceneId && stoppedScenesRef.current.has(scene.sceneId)) {
          // A round that finished generating after the game ended the conversation
          log.debug('TTS scene arrived for a conversation that already ended — dropping it');
          reportDroppedScene(scene);
          return;
        }
        // Priority scenes rank ahead of autonomous ones but FIFO among themselves, and a
        // round never jumps an earlier round of its own conversation; at the cap the
        // oldest non-priority scene is dropped — the newest matches what is happening on
        // screen right now, the oldest is furthest behind gameplay
        insertScene(sceneQueueRef.current, scene, maxQueuedScenes, (dropped) => {
          log.debug(`TTS scene queue full — dropping oldest queued scene`);
          reportDroppedScene(dropped);
        });
        void drainSceneQueue();
      },
    );
    return () => {
      removeListener();
    };
  }, [drainSceneQueue, reportDroppedScene]);

  // V-2: the player pressing the talk hotkey pre-empts everything — the current line
  // stops and the waiting scenes are flushed (dropped scenes report back so the mod
  // closes their subtitles). The reply then plays first by construction.
  useEffect(() => {
    const removeListener = window.electron.onVoiceRecordStart(() => {
      log.info('[TTS] player voice pre-empts playback: stopping current line, flushing the scene queue');
      stop();
    });
    return () => {
      removeListener();
    };
  }, [stop]);

  // The game ended a conversation: a sim walked out of the room, or left the lot.
  // Soft lets the line being spoken finish and drops the rest; hard cuts it off now.
  useEffect(() => {
    const removeListener = window.electron.onSceneStop(
      (_event: any, payload: { sceneId: string; mode: 'soft' | 'hard' }) => {
        const { sceneId, mode } = payload;
        log.info(`[TTS] the game ended scene ${sceneId} (${mode}); dropping the rest of it`);
        stoppedScenesRef.current.set(sceneId, mode);
        // Rounds of this conversation still waiting their turn never play
        const remaining: QueuedScene[] = [];
        sceneQueueRef.current.forEach((queued) => {
          if (queued.sceneId === sceneId) {
            reportDroppedScene(queued);
          } else {
            remaining.push(queued);
          }
        });
        sceneQueueRef.current = remaining;
        if (mode === 'hard' && currentSceneRef.current?.sceneId === sceneId) {
          tts?.stop();
        }
      },
    );
    return () => {
      removeListener();
    };
  }, [tts, reportDroppedScene]);

  const contextValue = useMemo(() => {
    return {
      speak,
      stop,
      isWebGPUSupported,
      isPlaying: tts?.isPlaying,
      error: tts?.error,
    };
  }, [speak, stop, isWebGPUSupported, tts]);

  return <TTSAudioContext value={contextValue}>{children}</TTSAudioContext>;
}

export const useTTS = (): TTSAudioContextType => {
  const context = use(TTSAudioContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};
