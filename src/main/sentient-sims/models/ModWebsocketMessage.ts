import { MemoryEntity } from '../db/entities/MemoryEntity';

export enum ModWebsocketMessageType {
  NOTIFICATION = 'notification',
  CLEAR_SIM_CACHE = 'clear_sim_cache',
  MIGRATE_SINGLE_SLOT_SAVE = 'migrate_single_slot_save',
  MEMORY_DELETED = 'memory_deleted',
  MEMORY_EDITED = 'memory_edited',
  MEMORY_CREATED = 'memory_created',
  ADD_BUFF = 'add_buff',
  SCENE_LINE = 'scene_line',
}

export type ModWebsocketMessage = {
  type: ModWebsocketMessageType;
};

export enum ModWebsocketNotificationType {
  ERROR = 'error',
  MESSAGE = 'message',
}

export type ModWebsocketNotification = ModWebsocketMessage & {
  notification: {
    title: string;
    message: string;
    message_type: ModWebsocketNotificationType;
  };
};

export type ModWebsocketNotificationMemoryDeleted = ModWebsocketMessage & {
  memory_id: number;
};

export type ModWebsocketNotificationMemoryEdited = ModWebsocketMessage & {
  memory: MemoryEntity;
};

// paced means the app will stream the memory's dialogue lines one at a time as
// SCENE_LINE messages timed to voice playback, so the mod should not display the
// whole memory as one subtitle block
export type ModWebsocketNotificationMemoryCreated = ModWebsocketMessage & {
  memory: MemoryEntity;
  paced: boolean;
};

export type ModSceneLine = ModWebsocketMessage & {
  speaker: string;
  text: string;
  // The scene's driving action, shown above each line's subtitle section in-game
  preamble?: string;
};

export type ModAddBuff = ModWebsocketMessage & {
  sim_id: string;
  mood: string;
  buff_description: string;
};

export type WebsocketNotification =
  | ModWebsocketMessage
  | ModWebsocketNotification
  | ModWebsocketNotificationMemoryEdited
  | ModWebsocketNotificationMemoryDeleted
  | ModWebsocketNotificationMemoryCreated
  | ModAddBuff
  | ModSceneLine;
