import electron from 'electron';
import log from 'electron-log';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { WWInteractionEvent } from '../models/InteractionEvents';
import { InteractionEventResult } from '../models/InteractionEventResult';
import { DatabaseSession } from '../models/DatabaseSession';

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
}

export function notifyLocationChanged() {
  log.debug('Notifying renderer location changed');
  notifyAllWindows('on-location-changed');
}

export function sendChatGeneration(response: InteractionEventResult) {
  log.debug('Sending on-chat-generation from ai controller');
  notifyAllWindows('on-chat-generation', response);
}

export function sendPopUpNotification(message?: string) {
  if (message) {
    notifyAllWindows('popup-notification', message);
  }
}

export function notifyMapAnimation(event: WWInteractionEvent) {
  log.debug(
    'Notifying renderer to begin mapping animation',
    JSON.stringify(event, null, 2)
  );
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
