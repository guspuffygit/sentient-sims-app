import log from 'electron-log';
import { MemoryEntity, neutralizeMarkup, withDisplayContent } from '../db/entities/MemoryEntity';
import { InteractionMappingEvent, WWInteractionEvent } from '../models/InteractionEvents';
import { InteractionEventResult } from '../models/InteractionEventResult';
import { DatabaseSession } from '../models/DatabaseSession';
import { DeleteMemoryRequest } from '../models/GetMemoryRequest';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { CaughtError } from '../models/CaughtError';
import { OnlineMappingType } from '../models/MappingSource';
import { getAllBrowserWindows } from './browserWindows';
import { DialogueLine, parseDialogueLines } from '../formatter/PromptFormatter';
import { castVoicesForLines } from '../formatter/ElevenLabsVoiceCasting';
import { SentientSim } from '../models/SentientSim';
import { consumePacedScene } from './pacedScenes';

function notifyAllWindows(message: string, ...args: unknown[]) {
  getAllBrowserWindows().forEach((wnd) => {
    if (!wnd.webContents.isDestroyed()) {
      wnd.webContents.send(message, ...args);
    }
  });
}

export function notifySettingChanged(setting: string, value: unknown) {
  notifyAllWindows('setting-changed', setting, value);
}

export function notifyNewMemoryAdded(memory: MemoryEntity, options?: { notifyMod?: boolean }) {
  log.debug('Sending new memory added to renderer');
  notifyAllWindows('on-new-memory-added', memory);
  // Bookkeeping rows (e.g. outcome memories) skip the mod: memory_created triggers subtitle
  // display and pauses the game clock, which only dialogue memories should do
  if (options?.notifyMod === false) {
    return;
  }
  sendModNotification({
    type: ModWebsocketMessageType.MEMORY_CREATED,
    // The Flash memories window can't render a null content, and one bad row in its
    // list blanks the whole window on every redraw (see withDisplayContent)
    memory: withDisplayContent(memory),
    paced: consumePacedScene(memory.content),
  });
}

export function notifyMemoryDeleted(deleteMemoryRequest: DeleteMemoryRequest) {
  log.debug('Sending memory deleted to renderer');
  notifyAllWindows('on-memory-deleted', deleteMemoryRequest);
  sendModNotification({
    type: ModWebsocketMessageType.MEMORY_DELETED,
    // Real DB rows have small autoincrement ids; Number() keeps the message JSON-safe
    // (JSON.stringify throws on bigint)
    memory_id: Number(deleteMemoryRequest.id),
  });
}

export function notifyPatreonLinking(isLinking: boolean) {
  log.debug(`Sending isLinking to renderer: ${isLinking}`);
  notifyAllWindows('on-linking-patreon', isLinking);
}

export function notifyMemoryEdited(memory: MemoryEntity) {
  log.debug('Sending memory edited to renderer');
  notifyAllWindows('on-memory-edited', memory);
  sendModNotification({
    type: ModWebsocketMessageType.MEMORY_EDITED,
    memory: withDisplayContent(memory),
  });
}

export function notifyLocationChanged() {
  log.debug('Notifying renderer location changed');
  notifyAllWindows('on-location-changed');
}

export function notifyRefreshAuth() {
  log.debug('Notifying renderer to refresh auth');
  notifyAllWindows('refresh-auth');
}

export function notifyRefreshUserAttributes() {
  log.debug('Notifying renderer to refresh user attributes');
  notifyAllWindows('refresh-user-attributes');
}

export function notifyGoogleAuthComplete(code: string, state: string) {
  log.debug('Notifying renderer google auth complete');
  notifyAllWindows('google-auth-complete', code, state);
}

export function sendChatGeneration(response: InteractionEventResult) {
  log.debug('Sending on-chat-generation from ai controller');
  notifyAllWindows('on-chat-generation', response);
}

export function playTTSLines(
  lines: DialogueLine[],
  sims?: SentientSim[],
  options?: {
    paced?: boolean;
    preamble?: string;
    pacedText?: string;
    // Voice ids the user pinned to specific sims, keyed by sim id
    voiceOverrides?: Map<string, string>;
  },
) {
  log.debug('Sending on-voice');
  let castLines = lines;
  if (sims && sims.length > 0) {
    castLines = castVoicesForLines(lines, sims, options?.voiceOverrides);
  }
  notifyAllWindows('on-voice', castLines, {
    paced: options?.paced ?? false,
    preamble: options?.preamble,
    pacedText: options?.pacedText,
  });
}

// Called as each scene line starts playing so the in-game subtitle appears in step
// with the voice playback; the preamble (the scene's driving action) heads each
// line's subtitle section in-game
export function sendSceneLineToMod(line: DialogueLine & { preamble?: string }) {
  sendModNotification({
    type: ModWebsocketMessageType.SCENE_LINE,
    speaker: line.speaker,
    // Scene lines land in the same Flash htmlText list as memories — see neutralizeMarkup
    text: neutralizeMarkup(line.text),
    preamble: line.preamble ? neutralizeMarkup(line.preamble) : line.preamble,
  });
}

export function playTTS(text: string, sims?: SentientSim[], voiceOverrides?: Map<string, string>) {
  const lines = parseDialogueLines(
    text,
    sims?.map((sim) => sim.name),
  );

  // parseDialogueLines drops anything that isn't attributed dialogue, which is right for
  // screenplay-format output but would swallow half of a prose response. Only speak line by
  // line when every line of the response was accounted for; otherwise read the whole thing.
  const nonEmptyLineCount = text.split('\n').filter((line) => line.trim().length > 0).length;
  if (lines.length < nonEmptyLineCount) {
    playTTSLines([{ speaker: 'Narrator', text: text.trim() }], sims, { voiceOverrides });
    return;
  }

  playTTSLines(lines, sims, { voiceOverrides });
}

export function sendPopUpNotification(message?: string) {
  if (message) {
    notifyAllWindows('popup-notification', message);
  }
}

export function sendPopUpCaughtErrorNotification(caughtError: CaughtError) {
  notifyAllWindows('caught-error-popup-notification', caughtError);
}

export function notifyMapAnimation(event: WWInteractionEvent) {
  log.debug('Notifying renderer to begin mapping animation', JSON.stringify(event, null, 2));
  notifyAllWindows('on-map-animation', event);
}

export function notifySimsChanged() {
  log.debug('Notifying renderer sims changed');
  notifyAllWindows('on-sims-changed');
}

export function notifyOnlineMappingsChanged(mappingType: OnlineMappingType) {
  log.debug(`Notifying renderer online ${mappingType} changed`);
  notifyAllWindows('on-online-mappings-changed', mappingType);
}

export function notifyUnmappedInteractionChanged() {
  log.debug('Notifying unmapped interactions changed');
  notifyAllWindows('on-interactions-changed');
}

export function notifyDatabaseLoaded(databaseSession: DatabaseSession) {
  log.debug('Sending database loaded');
  notifyAllWindows('on-database-loaded', databaseSession.sessionId);
}

export function notifyMapInteraction(event: InteractionMappingEvent) {
  log.debug('Notifying renderer to begin mapping interaction', JSON.stringify(event, null, 2));
  notifyAllWindows('on-map-interaction', event);
}
