import fs from 'fs';
import os from 'os';
import path from 'path';
import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { SettingsService, defaultStore } from 'main/sentient-sims/services/SettingsService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ss-fresh-install-'));
}

// A Sims 4 user folder as the game leaves it: GameVersion.txt beside Mods
function makeSims4Folder(documents: string, folderName = 'The Sims 4'): string {
  const sims4 = path.join(documents, 'Electronic Arts', folderName);
  fs.mkdirSync(path.join(sims4, 'Mods'), { recursive: true });
  fs.writeFileSync(path.join(sims4, 'GameVersion.txt'), '1.124.63');
  return path.join(sims4, 'Mods');
}

function newSettings(): SettingsService {
  return new SettingsService(defaultStore(path.join(tempRoot(), 'electronConfig')));
}

describe('Mods folder detection', () => {
  const savedEnv = { ...process.env };
  let home: string;

  beforeEach(() => {
    home = tempRoot();
    process.env.USERPROFILE = home;
    process.env.HOME = home;
    delete process.env.OneDrive;
    delete process.env.OneDriveConsumer;
    delete process.env.OneDriveCommercial;
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  it('keeps a stored Mods folder that is valid', () => {
    const settings = newSettings();
    const mods = makeSims4Folder(path.join(tempRoot(), 'Elsewhere'));
    settings.modsDirectory = mods;
    expect(new DirectoryService(settings).detectModsDirectory()).toEqual(mods);
  });

  it("finds the folder under OneDrive's Documents", () => {
    const settings = newSettings();
    settings.modsDirectory = path.join(home, 'nowhere', 'Mods');
    const oneDrive = path.join(home, 'OneDrive - Personal');
    process.env.OneDrive = oneDrive;
    const mods = makeSims4Folder(path.join(oneDrive, 'Documents'));
    expect(new DirectoryService(settings).detectModsDirectory()).toEqual(mods);
    expect(settings.modsDirectory).toEqual(mods);
  });

  it('finds a localized game folder', () => {
    const settings = newSettings();
    settings.modsDirectory = path.join(home, 'nowhere', 'Mods');
    const mods = makeSims4Folder(path.join(home, 'Documents'), 'Die Sims 4');
    expect(new DirectoryService(settings).detectModsDirectory()).toEqual(mods);
  });

  it("uses Electron's Documents folder when it is somewhere else", () => {
    const settings = newSettings();
    settings.modsDirectory = path.join(home, 'nowhere', 'Mods');
    const documents = path.join(tempRoot(), 'D-drive', 'Documents');
    const mods = makeSims4Folder(documents);
    expect(new DirectoryService(settings, documents).detectModsDirectory()).toEqual(mods);
  });

  it('leaves the stored folder alone when the game is nowhere to be found', () => {
    const settings = newSettings();
    const stored = path.join(home, 'nowhere', 'Mods');
    settings.modsDirectory = stored;
    expect(new DirectoryService(settings).detectModsDirectory()).toBeUndefined();
    expect(settings.modsDirectory).toEqual(stored);
  });
});

describe('Setup complete migration', () => {
  it('a fresh store still needs the setup wizard', () => {
    const settings = newSettings();
    settings.runMigrations();
    expect(settings.get(SettingsEnum.SETUP_COMPLETE)).toBe(false);
    expect(settings.get(SettingsEnum.SETUP_COMPLETE_SEEDED)).toBe(true);
  });

  it('an existing install is marked set up once', () => {
    const settings = newSettings();
    // An earlier run seeded the provider configs, before the setup flag existed
    settings.runMigrations();
    settings.set(SettingsEnum.SETUP_COMPLETE_SEEDED, false);
    settings.runMigrations();
    expect(settings.get(SettingsEnum.SETUP_COMPLETE)).toBe(true);
  });

  it('voices and voice input are on for a new player', () => {
    const settings = newSettings();
    settings.runMigrations();
    expect(settings.ttsEnabled).toBe(true);
    expect(settings.voiceInputEnabled).toBe(true);
  });

  it('an existing install keeps voices and voice input as they were', () => {
    const settings = newSettings();
    settings.runMigrations();
    settings.set(SettingsEnum.SETUP_COMPLETE_SEEDED, false);
    settings.set(SettingsEnum.TTS_ENABLED, false);
    settings.set(SettingsEnum.VOICE_INPUT_ENABLED, false);
    settings.runMigrations();
    expect(settings.ttsEnabled).toBe(false);
    expect(settings.voiceInputEnabled).toBe(false);
  });
});
