/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { DbService } from 'main/sentient-sims/services/DbService';
import * as fs from 'fs';
import { DatabaseNotLoadedError } from 'main/sentient-sims/exceptions/DatabaseNotLoadedError';
import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { mockDirectoryService } from './util';

describe('DbService', () => {
  let directoryService: DirectoryService;
  let dbService: DbService;

  beforeEach(() => {
    directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    dbService = new DbService(directoryService);
  });

  it('No loaded db throws exception', () => {
    expect(dbService.getDb).toThrow(DatabaseNotLoadedError);
  });

  it('Loading unloading database', async () => {
    dbService.loadDatabase('1872638716');
    expect(directoryService.listSentientSimsDbUnsaved()).toHaveLength(3);

    dbService.loadDatabase('718297398');
    expect(directoryService.listSentientSimsDbUnsaved()).toHaveLength(6);
    await dbService.saveDatabase('718297398');
    expect(directoryService.listSentientSimsDbUnsaved()).toHaveLength(3);

    dbService.unloadDatabase();
    expect(directoryService.listSentientSimsDbUnsaved()).toHaveLength(0);
  });
});
