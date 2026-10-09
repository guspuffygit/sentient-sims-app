// What the device-code login persists (electron-store, same plaintext precedent as the
// app's other tokens). broadcasterId/login identify the connected account.
export type TwitchStoredAuth = {
  accessToken?: string;
  refreshToken?: string;
  broadcasterId?: string;
  login?: string;
};
