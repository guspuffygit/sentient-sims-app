export type WebsocketStatusResponse = {
  mod: boolean;
  renderer: boolean;
};

export type WebsocketStatusChange = {
  type: 'renderer' | 'mod';
  status: boolean;
};
