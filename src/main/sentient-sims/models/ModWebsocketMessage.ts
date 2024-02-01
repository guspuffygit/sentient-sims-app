export enum ModWebsocketMessageType {
  NOTIFICATION = 'notification',
  ANIMATION_MAPPING = 'animation_mapping',
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
