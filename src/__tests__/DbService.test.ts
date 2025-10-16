import '@testing-library/jest-dom';
import * as fs from 'fs';
import { DatabaseNotLoadedError } from 'main/sentient-sims/exceptions/DatabaseNotLoadedError';
import { mockApiContext } from './util';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';

describe('DbService', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
  });

  it('No loaded db throws exception', () => {
    expect(ctx.dbService.getDb).toThrow(DatabaseNotLoadedError);
  });

  it('Loading unloading database', async () => {
    ctx.dbService.loadDatabase({
      sessionId: '1872638716',
      saveId: '2',
    });
    expect(ctx.directoryService.listSentientSimsDbUnsaved()).toHaveLength(3);

    ctx.dbService.loadDatabase({
      sessionId: '718297398',
      saveId: '2',
    });
    expect(ctx.directoryService.listSentientSimsDbUnsaved()).toHaveLength(6);
    await ctx.dbService.saveDatabase({
      sessionId: '718297398',
      saveId: '2',
    });
    expect(ctx.directoryService.listSentientSimsDbUnsaved()).toHaveLength(3);

    ctx.dbService.unloadDatabase();
    expect(ctx.directoryService.listSentientSimsDbUnsaved()).toHaveLength(0);
  });
});
