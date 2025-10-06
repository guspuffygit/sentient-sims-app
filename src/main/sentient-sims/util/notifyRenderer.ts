import electron from 'electron';
import log from 'electron-log';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { InteractionMappingEvent, WWInteractionEvent } from '../models/InteractionEvents';
import { InteractionEventResult } from '../models/InteractionEventResult';
import { DatabaseSession } from '../models/DatabaseSession';
import { DeleteMemoryRequest } from '../models/GetMemoryRequest';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { CaughtError } from '../models/CaughtError';

function notifyAllWindows(message: string, ...args: any[]) {
  electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
    if (wnd.webContents?.isDestroyed() === false) {
      wnd.webContents.send(message, ...args);
    }
  });
}

export function notifySettingChanged(setting: any, value: any) {
  notifyAllWindows('setting-changed', setting, value);
}

export function notifyNewMemoryAdded(memory: MemoryEntity) {
  log.debug('Sending new memory added to renderer');
  notifyAllWindows('on-new-memory-added', memory);
  sendModNotification({
    type: ModWebsocketMessageType.MEMORY_CREATED,
    memory,
  });
}

export function notifyMemoryDeleted(deleteMemoryRequest: DeleteMemoryRequest) {
  log.debug('Sending memory deleted to renderer');
  notifyAllWindows('on-memory-deleted', deleteMemoryRequest);
  sendModNotification({
    type: ModWebsocketMessageType.MEMORY_DELETED,
    memory_id: deleteMemoryRequest.id,
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
    memory,
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

export function playTTS(text: string) {
  log.debug('Sending on-voice');
  notifyAllWindows('on-voice', text);
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
