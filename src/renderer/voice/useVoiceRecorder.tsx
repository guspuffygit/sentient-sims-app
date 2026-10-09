import { useEffect, useRef, useState } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';

export type VoiceRecorderState = {
  isRecording: boolean;
  lastTranscript?: string;
  error?: string;
};

// The main process owns the hotkey and the state machine; this hook is its hands: it
// starts/stops a MediaRecorder on IPC command and hands the finished audio back for
// transcription. The mic is only held between start and stop.
export function useVoiceRecorder(): VoiceRecorderState {
  const deviceIdSetting = useSetting<string>(SettingsEnum.VOICE_INPUT_DEVICE_ID, '');
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>();
  const [error, setError] = useState<string>();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const deviceIdRef = useRef(deviceIdSetting.value);

  useEffect(() => {
    deviceIdRef.current = deviceIdSetting.value;
  }, [deviceIdSetting.value]);

  useEffect(() => {
    // A stop that lands while getUserMedia is still resolving must still end the
    // recording, or the mic stays hot after the player releases the hotkey
    let stopRequested = false;

    const stopRecorder = () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };

    const handleStart = async () => {
      if (recorderRef.current) {
        return;
      }
      stopRequested = false;
      try {
        const deviceId = deviceIdRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          if (recorderRef.current === recorder) {
            recorderRef.current = null;
          }
          setIsRecording(false);
          const blob = new Blob(chunks, { type: 'audio/webm' });
          blob
            .arrayBuffer()
            .then((audio) => window.electron.transcribeVoice(audio, 'audio/webm'))
            .catch((err: unknown) => {
              log.error('Voice recording delivery failed', err);
              window.electron.notifyVoiceRecordError(err instanceof Error ? err.message : String(err));
            });
        };
        recorder.start();
        recorderRef.current = recorder;
        setIsRecording(true);
        setError(undefined);
        // handleStop flips this while getUserMedia awaits — TS's narrowing can't see
        // the cross-closure mutation
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (stopRequested) {
          recorder.stop();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error('Voice recording failed to start', err);
        setError(message);
        window.electron.notifyVoiceRecordError(message);
      }
    };

    const handleStop = () => {
      stopRequested = true;
      stopRecorder();
    };

    const unsubscribeStart = window.electron.onVoiceRecordStart(() => void handleStart());
    const unsubscribeStop = window.electron.onVoiceRecordStop(handleStop);
    const unsubscribeTranscript = window.electron.onVoiceTranscript((_event, text: string) => {
      setLastTranscript(text);
    });

    return () => {
      unsubscribeStart();
      unsubscribeStop();
      unsubscribeTranscript();
      handleStop();
    };
  }, []);

  return { isRecording, lastTranscript, error };
}
