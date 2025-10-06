import { MemoryEntity } from '../db/entities/MemoryEntity';

export enum ModWebsocketMessageType {
  NOTIFICATION = 'notification',
  CLEAR_SIM_CACHE = 'clear_sim_cache',
  MIGRATE_SINGLE_SLOT_SAVE = 'migrate_single_slot_save',
  MEMORY_DELETED = 'memory_deleted',
  MEMORY_EDITED = 'memory_edited',
  MEMORY_CREATED = 'memory_created',
  ADD_BUFF = 'add_buff',
  ADD_SLEEPING_BUFF = 'add_sleeping_buff',
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
  | ModAddBuff;
