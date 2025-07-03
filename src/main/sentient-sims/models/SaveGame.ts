export enum SaveGameType {
  SAVED = 'SAVED',
  UNSAVED = 'UNSAVED',
}

export type SaveGame = {
  name: string;
  type: SaveGameType;
};

export function ToSaveGameType(saveGameType: string): SaveGameType {
  if (Object.values(SaveGameType).includes(saveGameType as SaveGameType)) {
    return saveGameType as SaveGameType;
  }

  throw Error(`Unknown SaveGameType ${saveGameType}`);
}
