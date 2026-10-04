// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
// Bridges renderer electron-log calls into the main process transports (main.log). With a
// custom preload script this import is required — without it renderer logs (TTS/voice
// activity especially) silently go nowhere, which made voice bugs undebuggable from logs.
import 'electron-log/preload';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';
import { CaughtError } from './sentient-sims/models/CaughtError';
import type {
  TierEventChannel,
  TierEventChannels,
  TierInvokeArgs,
  TierInvokeChannel,
  TierInvokeResult,
} from './sentient-sims/tiers/ipc';

type IpcCallback = (event: IpcRendererEvent, ...args: any[]) => void;

const electronHandler = {
  onDebugModeToggle: (callback: IpcCallback) => {
    return ipcRenderer.on('debug-mode-toggle', callback);
  },
  onChatGeneration: (callback: IpcCallback) => {
    ipcRenderer.on('on-chat-generation', callback);

    return () => ipcRenderer.removeListener('on-chat-generation', callback);
  },
  onPopupNotification: (callback: IpcCallback) => {
    return ipcRenderer.on('popup-notification', callback);
  },
  onCaughtErrorPopupNotification: (callback: (_event: IpcRendererEvent, caughtError: CaughtError) => any) => {
    ipcRenderer.on('caught-error-popup-notification', callback);

    return () => ipcRenderer.removeListener('caught-error-popup-notification', callback);
  },
  selectDirectory: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectDirectory') as Promise<string | null>;
  },
  selectGameApp: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectGameApp') as Promise<string | null>;
  },
  isMac: process.platform === 'darwin',
  setSetting: (setting: SettingsEnum, value: any) => {
    ipcRenderer.send('set-setting', setting, value);
  },
  resetSetting: (setting: SettingsEnum) => {
    ipcRenderer.send('reset-setting', setting);
  },
  onAuth: (callback: IpcCallback) => {
    ipcRenderer.on('on-auth', callback);

    return () => ipcRenderer.removeListener('on-auth', callback);
  },
  refreshAuth: (callback: IpcCallback) => {
    ipcRenderer.on('refresh-auth', callback);

    return () => ipcRenderer.removeListener('refresh-auth', callback);
  },
  refreshUserAttributes: (callback: IpcCallback) => {
    ipcRenderer.on('refresh-user-attributes', callback);

    return () => ipcRenderer.removeListener('refresh-user-attributes', callback);
  },
  onLinkingPatreon: (callback: IpcCallback) => {
    ipcRenderer.on('on-linking-patreon', callback);

    return () => ipcRenderer.removeListener('on-linking-patreon', callback);
  },
  onSuccessfulAuth: () => {
    ipcRenderer.send('on-successful-auth');
  },
  onSettingChange: (callback: IpcCallback) => {
    ipcRenderer.on('setting-changed', callback);

    return () => ipcRenderer.removeListener('setting-changed', callback);
  },
  openBrowserLink: (link: string) => {
    ipcRenderer.send('open-browser-link', link);
  },
  onNewMemoryAdded: (callback: IpcCallback) => {
    ipcRenderer.on('on-new-memory-added', callback);

    return () => ipcRenderer.removeListener('on-new-memory-added', callback);
  },
  onMemoryDeleted: (callback: IpcCallback) => {
    ipcRenderer.on('on-memory-deleted', callback);

    return () => ipcRenderer.removeListener('on-memory-deleted', callback);
  },
  onMemoryEdited: (callback: IpcCallback) => {
    ipcRenderer.on('on-memory-edited', callback);

    return () => ipcRenderer.removeListener('on-memory-edited', callback);
  },
  onLocationChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-location-changed', callback);

    return () => ipcRenderer.removeListener('on-location-changed', callback);
  },
  onSimsChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-sims-changed', callback);

    return () => ipcRenderer.removeListener('on-sims-changed', callback);
  },
  onInteractionsChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-interactions-changed', callback);

    return () => ipcRenderer.removeListener('on-interactions-changed', callback);
  },
  onOnlineMappingsChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-online-mappings-changed', callback);

    return () => ipcRenderer.removeListener('on-online-mappings-changed', callback);
  },
  onDatabaseLoaded: (callback: IpcCallback) => {
    ipcRenderer.on('on-database-loaded', callback);

    return () => ipcRenderer.removeListener('on-database-loaded', callback);
  },
  onDatabaseUnloaded: (callback: IpcCallback) => {
    ipcRenderer.on('on-database-unloaded', callback);

    return () => ipcRenderer.removeListener('on-database-unloaded', callback);
  },
  onMapAnimation: (callback: IpcCallback) => {
    ipcRenderer.on('on-map-animation', callback);

    return () => ipcRenderer.removeListener('on-map-animation', callback);
  },
  apiKeyPasteButtonClick: () => {
    ipcRenderer.send('paste-clipboard-to-api-key-button-click');
  },
  onApiKeyPasteFromClipboard: (callback: IpcCallback) => {
    ipcRenderer.on('on-api-key-paste-from-clipboard', callback);

    return () => ipcRenderer.removeListener('on-api-key-paste-from-clipboard', callback);
  },
  onMapInteraction: (callback: IpcCallback) => {
    ipcRenderer.on('on-map-interaction', callback);

    return () => ipcRenderer.removeListener('on-map-interaction', callback);
  },
  onGoogleAuthComplete: (callback: IpcCallback) => {
    ipcRenderer.on('google-auth-complete', callback);

    return () => ipcRenderer.removeListener('google-auth-complete', callback);
  },
  onVoice: (callback: IpcCallback) => {
    ipcRenderer.on('on-voice', callback);

    return () => ipcRenderer.removeListener('on-voice', callback);
  },
  notifySceneLineShown: (line: {
    speaker: string;
    text: string;
    preamble?: string;
    voiced?: boolean;
    simId?: string;
    sceneId?: string;
    participantSimIds?: string[];
    continues?: boolean;
  }) => {
    ipcRenderer.send('scene-line-shown', line);
  },
  notifySceneLineEnded: (line: { speaker: string; text: string; sceneId?: string; continues?: boolean }) => {
    ipcRenderer.send('scene-line-ended', line);
  },
  notifySceneDropped: (pacedText: string) => {
    ipcRenderer.send('scene-dropped', pacedText);
  },
  // A scene's playback is over: completed false means it was cut short
  notifyScenePlaybackEnded: (payload: { sceneId: string; completed: boolean }) => {
    ipcRenderer.send('scene-playback-ended', payload);
  },
  // The game ended a conversation partway (a sim walked away or left the lot)
  onSceneStop: (callback: IpcCallback) => {
    ipcRenderer.on('scene-stop', callback);

    return () => ipcRenderer.removeListener('scene-stop', callback);
  },
  onClockState: (callback: IpcCallback) => {
    ipcRenderer.on('clock-state', callback);

    return () => ipcRenderer.removeListener('clock-state', callback);
  },
  onProviderHealth: (callback: IpcCallback) => {
    ipcRenderer.on('provider-health', callback);

    return () => ipcRenderer.removeListener('provider-health', callback);
  },
  onWebsocketStatusChange: (callback: IpcCallback) => {
    ipcRenderer.on('websocket-status-change', callback);

    return () => ipcRenderer.removeListener('websocket-status-change', callback);
  },
  onVoiceRecordStart: (callback: IpcCallback) => {
    ipcRenderer.on('voice-record-start', callback);

    return () => ipcRenderer.removeListener('voice-record-start', callback);
  },
  onVoiceRecordStop: (callback: IpcCallback) => {
    ipcRenderer.on('voice-record-stop', callback);

    return () => ipcRenderer.removeListener('voice-record-stop', callback);
  },
  onVoiceTranscript: (callback: IpcCallback) => {
    ipcRenderer.on('voice-transcript', callback);

    return () => ipcRenderer.removeListener('voice-transcript', callback);
  },
  transcribeVoice: (audio: ArrayBuffer, mimeType?: string): Promise<string> => {
    return ipcRenderer.invoke('voice-transcribe', audio, mimeType) as Promise<string>;
  },
  testTranscribeVoice: (audio: ArrayBuffer, mimeType?: string): Promise<{ text?: string; error?: string }> => {
    return ipcRenderer.invoke('voice-transcribe-test', audio, mimeType) as Promise<{ text?: string; error?: string }>;
  },
  notifyVoiceRecordError: (message: string) => {
    ipcRenderer.send('voice-record-error', message);
  },
  // Channels a build tier adds (tiers/ipc.ts). Typed over interfaces the tier's own files
  // augment, so a stripped build has no channel names and a leftover caller fails tsc.
  tierInvoke: <C extends TierInvokeChannel>(channel: C, ...args: TierInvokeArgs<C>): Promise<TierInvokeResult<C>> => {
    return ipcRenderer.invoke(channel, ...args) as Promise<TierInvokeResult<C>>;
  },
  tierOn: <C extends TierEventChannel>(
    channel: C,
    callback: (event: IpcRendererEvent, payload: TierEventChannels[C]) => void,
  ) => {
    const listener = (event: IpcRendererEvent, payload: TierEventChannels[C]) => {
      callback(event, payload);
    };
    ipcRenderer.on(channel, listener);

    return () => ipcRenderer.removeListener(channel, listener);
  },
  setAmplify: async (key: string, value: string): Promise<unknown> => {
    return ipcRenderer.invoke('set-amplify', key, value);
  },
  getAmplify: async (key: string): Promise<string | null> => {
    return ipcRenderer.invoke('get-amplify', key) as Promise<string | null>;
  },
  removeAmplify: async (key: string): Promise<unknown> => {
    return ipcRenderer.invoke('remove-amplify', key);
  },
  clearAmplify: async (): Promise<unknown> => {
    return ipcRenderer.invoke('reset-amplify');
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
