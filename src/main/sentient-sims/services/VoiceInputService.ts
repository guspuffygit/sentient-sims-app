import log from 'electron-log';
import { correctNames, correctPlaces } from '../util/nameCorrection';
import { isPlaceholderName } from '../util/simAliases';
import { ApiContext } from './ApiContext';
import { VoiceHotkeyService } from './VoiceHotkeyService';
import { SettingsEnum } from '../models/SettingsEnum';
import { voiceInputMaxRecordMs, voiceInputMinAudioBytes } from '../constants';
import { sendPlayerVoiceMessageToMod, sendPlayerVoiceStatusToMod, sendPopUpNotification } from '../util/notifyRenderer';
import { isWebSocketConnected, setVoiceKeySink } from '../websocketServer';
import { getAllBrowserWindows } from '../util/browserWindows';

type VoiceInputState = 'idle' | 'listening' | 'transcribing';

// If the renderer never delivers the recording (window reloaded mid-hold, recorder
// wedged), return to idle so the hotkey keeps working
const audioDeliveryTimeoutMs = 45000;

function notifyAllWindows(message: string, ...args: unknown[]) {
  getAllBrowserWindows().forEach((wnd) => {
    if (!wnd.webContents.isDestroyed()) {
      wnd.webContents.send(message, ...args);
    }
  });
}

// Hold-to-talk orchestration: the hotkey (heard by the game overlay, relayed by the
// mod) starts/stops a renderer MediaRecorder over IPC, the audio comes back for
// transcription, and the transcript goes to the mod over the websocket as the active
// sim's spoken line. The mic is only hot between record-start and record-stop.
export class VoiceInputService {
  private readonly ctx: ApiContext;

  private readonly hotkey: VoiceHotkeyService;

  private state: VoiceInputState = 'idle';

  private forceStopTimer?: NodeJS.Timeout;

  private deliveryTimer?: NodeJS.Timeout;

  constructor(ctx: ApiContext, hotkey?: VoiceHotkeyService) {
    this.ctx = ctx;
    this.hotkey = hotkey ?? new VoiceHotkeyService();
  }

  initialize() {
    setVoiceKeySink(this.hotkey);
    this.armHotkey();
  }

  shutdown() {
    setVoiceKeySink(undefined);
    this.hotkey.shutdown();
    this.reset();
  }

  onSettingChanged(key: string) {
    if (
      key === (SettingsEnum.VOICE_INPUT_ENABLED as string) ||
      key === (SettingsEnum.VOICE_INPUT_HOTKEY as string) ||
      key === (SettingsEnum.VOICE_INPUT_HOTKEY_MODE as string) ||
      key === (SettingsEnum.VOICE_COMMAND_HOTKEY as string)
    ) {
      this.armHotkey();
    }
  }

  private armHotkey() {
    if (!this.ctx.settings.voiceInputEnabled) {
      this.hotkey.disarm();
      this.reset();
      return;
    }
    this.hotkey.arm(this.ctx.settings.voiceInputHotkey, this.ctx.settings.voiceInputHotkeyMode, {
      onDown: () => {
        this.startListening();
      },
      onUp: () => {
        this.stopListening();
      },
      onToggle: () => {
        if (this.state === 'listening') {
          this.stopListening();
        } else {
          this.startListening();
        }
      },
    });
    // V-8: the second chord — same capture, but the transcript is an order. Only a build
    // with the autonomy tier can carry one out, so without it the chord is never armed.
    if (!this.ctx.ext.voiceCommand) {
      return;
    }
    this.hotkey.armCommand(this.ctx.settings.voiceCommandHotkey, {
      onDown: () => {
        this.startListening('command');
      },
      onUp: () => {
        this.stopListening();
      },
      onToggle: () => {
        if (this.state === 'listening') {
          this.stopListening();
        } else {
          this.startListening('command');
        }
      },
    });
  }

  // V-8: what the current capture IS — talk to the sim, or an order for the sim
  private captureMode: 'chat' | 'command' = 'chat';

  startListening(mode: 'chat' | 'command' = 'chat') {
    if (!this.ctx.settings.voiceInputEnabled || this.state !== 'idle') {
      return;
    }
    this.captureMode = mode;
    if (!isWebSocketConnected('mod')) {
      sendPopUpNotification('Voice input: the game is not connected');
      return;
    }
    this.state = 'listening';
    notifyAllWindows('voice-record-start');
    sendPlayerVoiceStatusToMod('listening', undefined, {
      speaker: this.ctx.settings.playerSpeakerName,
      mode: this.captureMode,
    });
    // Backstop for a lost keyup (alt-tab mid-hold): never leave the mic hot
    this.forceStopTimer = setTimeout(() => {
      this.stopListening();
    }, voiceInputMaxRecordMs);
  }

  stopListening() {
    if (this.state !== 'listening') {
      return;
    }
    this.clearForceStop();
    this.state = 'transcribing';
    notifyAllWindows('voice-record-stop');
    sendPlayerVoiceStatusToMod('transcribing');
    this.deliveryTimer = setTimeout(() => {
      log.error('Voice recording was never delivered by the renderer');
      this.reset();
    }, audioDeliveryTimeoutMs);
  }

  // Invoked from the renderer once the recording blob is assembled
  async handleAudio(audio: ArrayBuffer, mimeType?: string): Promise<string> {
    try {
      // Shorter than any word: an accidental hotkey tap, dropped without ceremony
      if (audio.byteLength < voiceInputMinAudioBytes) {
        return '';
      }
      const raw = await this.ctx.transcription.transcribe(audio, mimeType);
      if (!raw) {
        sendPlayerVoiceStatusToMod('error', 'Heard nothing');
        return '';
      }
      // V-7 post-pass: snap misheard worlds ("Dale Sol Valley") and near-miss names to
      // the game's spelling. The settings Test button goes through transcribe()
      // directly and stays raw on purpose.
      const text = correctNames(correctPlaces(raw), this.knownNames(), this.onLotNames());
      if (text !== raw) {
        log.info(`Voice input transcript corrected: "${raw}" -> "${text}"`);
      }
      log.info(`Voice input transcript${this.captureMode === 'command' ? ' (command)' : ''}: ${text}`);
      notifyAllWindows('voice-transcript', text);
      if (this.captureMode === 'command') {
        // V-8: an order, not talk — mapped to an offered action and dispatched; the
        // chat event is skipped entirely
        await this.ctx.ext.voiceCommand?.handleCommand(text);
        return text;
      }
      sendPlayerVoiceMessageToMod(text);
      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendPlayerVoiceStatusToMod('error', 'Transcription failed');
      sendPopUpNotification(`Voice transcription failed: ${message}`);
      return '';
    } finally {
      this.reset();
    }
  }

  // Every name the save knows, participants included. Deliberately wide: the player
  // pauses the game to talk, and paused reports carry no sims — a scene-scoped pool went
  // empty at exactly the moment corrections were needed (live 08-27). Filler-word snaps
  // are handled by correctNames' COMMON_WORDS guard instead of by shrinking this pool.
  private knownNames(): string[] {
    try {
      const report = this.ctx.simStateCache.getReport();
      const names = new Set<string>();
      const add = (name: string | undefined) => {
        if (name && !isPlaceholderName(name)) {
          names.add(name);
        }
      };
      (report?.sims ?? []).forEach((entry) => {
        add(entry.sim_name);
        entry.sims.forEach((sim) => {
          add(sim.name);
        });
      });
      (report?.known_sims ?? []).forEach((sim) => {
        add(sim.name);
      });
      try {
        this.ctx.participantRepository.getAllParticipants().forEach((participant) => {
          add(participant.name);
        });
      } catch {
        // no DB loaded: the report names still apply
      }
      return [...names];
    } catch {
      return [];
    }
  }

  // J7: the names actually in play right now - the reported sims and everyone they see
  // in the room - so a phonetic tie between two known names goes to the one who is here
  private onLotNames(): string[] {
    try {
      const entries = this.ctx.simStateCache.getReport()?.sims;
      const names = new Set<string>();
      if (!entries) {
        return [];
      }
      entries.forEach((entry) => {
        if (entry.sim_name && !isPlaceholderName(entry.sim_name)) {
          names.add(entry.sim_name);
        }
        entry.sims.forEach((sim) => {
          if (sim.name && !isPlaceholderName(sim.name)) {
            names.add(sim.name);
          }
        });
      });
      return [...names];
    } catch {
      return [];
    }
  }

  // Renderer-side mic failure (no permission, no device, recorder error)
  handleRecordError(message: string) {
    log.error(`Voice recording failed in renderer: ${message}`);
    sendPlayerVoiceStatusToMod('error', 'Microphone unavailable');
    sendPopUpNotification(`Voice input microphone error: ${message}`);
    this.reset();
  }

  private reset() {
    this.clearForceStop();
    if (this.deliveryTimer) {
      clearTimeout(this.deliveryTimer);
      this.deliveryTimer = undefined;
    }
    // The mod reads clicks on sims as target picks until it hears the hold ended
    if (this.state === 'listening') {
      sendPlayerVoiceStatusToMod('cancelled');
    }
    this.state = 'idle';
  }

  private clearForceStop() {
    if (this.forceStopTimer) {
      clearTimeout(this.forceStopTimer);
      this.forceStopTimer = undefined;
    }
  }
}
