import { IpcMainEvent, clipboard, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { SettingsEnum } from './models/SettingsEnum';
import { notifySettingChanged, sendSceneLineEndedToMod, sendSceneLineToMod } from './util/notifyRenderer';
import { unmarkScenePaced } from './util/pacedScenes';
import { redactSettingValue } from './util/redactSetting';
import { DialogueLine } from './formatter/PromptFormatter';
import { getAllBrowserWindows } from './util/browserWindows';
import { resolveHtmlPath } from '../util';
import { ApiContext } from './services/ApiContext';
import { VoiceInputService } from './services/VoiceInputService';
import { InteractionDTO } from './db/dto/InteractionDTO';
import { Animation } from './models/Animation';

async function handleSelectDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

async function handleSelectGameApp() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: '/Applications',
    properties: ['openFile'],
    filters: [{ name: 'Applications', extensions: ['app'] }],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

export default function ipcHandlers(ctx: ApiContext, voiceInput: VoiceInputService) {
  ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
  ipcMain.handle('dialog:selectGameApp', handleSelectGameApp);
  ipcMain.on('set-setting', (_event: IpcMainEvent, setting: SettingsEnum, value: unknown) => {
    if (setting !== SettingsEnum.ACCESS_TOKEN) {
      log.debug(`set-setting: ${setting}, value: ${String(redactSettingValue(setting, value))}`);
    }
    ctx.settings.set(setting, value);

    notifySettingChanged(setting, value);
  });
  ipcMain.on('reset-setting', (_event: IpcMainEvent, setting: SettingsEnum) => {
    const value = ctx.settings.resetSetting(setting.toString());
    notifySettingChanged(setting, value);
  });
  ipcMain.on('on-successful-auth', () => {
    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        void wnd.loadURL(resolveHtmlPath('index.html'));
      }
    });
  });
  ipcMain.on('open-browser-link', (_event: IpcMainEvent, link: string) => {
    void shell.openExternal(link);
  });
  // The renderer owns playback timing: it reports each scene line as it starts playing
  // so the in-game subtitle stays in step with the voices
  ipcMain.on(
    'scene-line-shown',
    (
      _event: IpcMainEvent,
      line: DialogueLine & {
        preamble?: string;
        voiced?: boolean;
        sceneId?: string;
        participantSimIds?: string[];
      },
    ) => {
      // Counted so a conversation cut short can trim its memory row to what was heard
      ctx.scenePlayback.lineShown(line.sceneId);
      sendSceneLineToMod(line);
    },
  );
  // ...and as each one's audio finishes, so the speaker's mouth stops with the voice
  ipcMain.on('scene-line-ended', (_event: IpcMainEvent, line: DialogueLine & { sceneId?: string }) => {
    sendSceneLineEndedToMod(line);
  });
  // A round's playback finished. `completed` false means the renderer cut it short, so
  // the pipeline stops feeding the conversation more rounds.
  ipcMain.on('scene-playback-ended', (_event: IpcMainEvent, payload: { sceneId: string; completed: boolean }) => {
    ctx.scenePlayback.playbackEnded(payload.sceneId, payload.completed);
  });
  // A paced scene the renderer never played would otherwise display nowhere in-game: its
  // block subtitle was suppressed on the promise that lines would stream. Un-mark it so the
  // memory_created broadcast falls back to the normal subtitle block.
  ipcMain.on('scene-dropped', (_event: IpcMainEvent, pacedText: string) => {
    unmarkScenePaced(pacedText);
  });
  ipcMain.on('paste-clipboard-to-api-key-button-click', () => {
    const clipboardResults = clipboard.readText();
    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        wnd.webContents.send('on-api-key-paste-from-clipboard', clipboardResults);
      }
    });
  });
  ipcMain.handle('save-interaction-locally', (event, interaction: InteractionDTO) => {
    const interactionRepo = ctx.interactionRepository;
    interactionRepo.saveLocalInteraction(interaction);
  });

  ipcMain.handle('save-animation-locally', (event, animation: Animation) => {
    const animationService = ctx.animations;
    animationService.saveLocalAnimation(animation);
  });

  // The renderer delivers the finished recording; transcription runs main-side so the
  // STT key never enters the renderer
  ipcMain.handle('voice-transcribe', (_event, audio: ArrayBuffer, mimeType?: string) => {
    return voiceInput.handleAudio(audio, mimeType);
  });
  ipcMain.on('voice-record-error', (_event: IpcMainEvent, message: string) => {
    voiceInput.handleRecordError(message);
  });
  // Settings-page "Test" path: transcribes without sending anything to the game
  ipcMain.handle('voice-transcribe-test', async (_event, audio: ArrayBuffer, mimeType?: string) => {
    try {
      const text = await ctx.transcription.transcribe(audio, mimeType);
      return { text };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  });

  // The build tiers' own channels (stream: the Twitch panel)
  for (const tier of ctx.tiers) {
    tier.ipc?.(ipcMain, ctx);
  }
}
