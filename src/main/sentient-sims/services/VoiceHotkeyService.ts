import log from 'electron-log';
import { sendVoiceHotkeysToMod } from '../util/notifyRenderer';
import { VoiceKeyEvent } from '../models/ModLogWebsocketMessage';

// The voice hotkey is heard by the game's overlay, not by the app (merge plan D8). The
// app tells the mod which chords it wants (sendVoiceHotkeysToMod, on every mod connect
// and voice setting change) and the overlay's input hook reports their presses and
// releases back over the websocket as `voice_key` events, which websocketServer hands
// to onKey(). No OS keyboard hook: no Accessibility prompt on macOS, nothing to break on
// Wayland, and the key only works while the game is focused, which is where the player
// is when they talk. The chord string ("Ctrl+Space") is the overlay's to parse; the
// key table lives in the mod's ui/voice_hotkey.cpp.

export type HotkeyCallbacks = {
  onDown: () => void;
  onUp: () => void;
  onToggle: () => void;
};

export type VoiceHotkeyBindings = { talk: string; command: string };

export class VoiceHotkeyService {
  private talkHotkey = '';

  private callbacks?: HotkeyCallbacks;

  // V-8: the command chord (speech = an order)
  private commandHotkey = '';

  private commandCallbacks?: HotkeyCallbacks;

  private mode: 'hold' | 'toggle' = 'hold';

  arm(hotkey: string, mode: 'hold' | 'toggle', callbacks: HotkeyCallbacks) {
    this.talkHotkey = hotkey;
    this.mode = mode;
    this.callbacks = callbacks;
    this.commandHotkey = '';
    this.commandCallbacks = undefined;
    this.publish();
    log.info(`Voice hotkey armed: ${hotkey} (${mode})`);
  }

  // V-8: arm the command chord (call after arm(); disarm() clears both)
  armCommand(hotkey: string, callbacks: HotkeyCallbacks) {
    this.commandHotkey = hotkey;
    this.commandCallbacks = hotkey ? callbacks : undefined;
    this.publish();
    if (hotkey) {
      log.info(`Voice command hotkey armed: ${hotkey}`);
    }
  }

  disarm() {
    this.talkHotkey = '';
    this.callbacks = undefined;
    this.commandHotkey = '';
    this.commandCallbacks = undefined;
    this.publish();
  }

  shutdown() {
    this.disarm();
  }

  // What the overlay listens for; empty strings clear a binding
  bindings(): VoiceHotkeyBindings {
    return { talk: this.talkHotkey, command: this.commandHotkey };
  }

  // A mod that just connected has no bindings yet
  onModConnected() {
    this.publish();
  }

  // One edge of a bound chord, reported by the overlay. The overlay already drops
  // auto-repeat and releases held chords when the game loses focus, so every event is
  // one press or one release.
  onKey(event: VoiceKeyEvent) {
    const callbacks = event.id === 'command' ? this.commandCallbacks : this.callbacks;
    if (!callbacks) {
      return;
    }
    if (this.mode === 'hold') {
      if (event.down) {
        callbacks.onDown();
      } else {
        callbacks.onUp();
      }
      return;
    }
    if (event.down) {
      callbacks.onToggle();
    }
  }

  private publish() {
    sendVoiceHotkeysToMod(this.bindings());
  }
}
