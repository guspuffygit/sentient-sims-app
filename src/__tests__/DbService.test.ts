import * as fs from 'fs';
import { DatabaseNotLoadedError } from 'main/sentient-sims/exceptions/DatabaseNotLoadedError';
import { mockApiContext } from './util';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';

describe('DbService', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
  });

  it('No loaded db throws exception', () => {
    expect(() => ctx.db.getDb()).toThrow(DatabaseNotLoadedError);
  });

  it('Loading unloading database', async () => {
    ctx.db.loadDatabase({
      sessionId: '1872638716',
      saveId: '2',
    });
    expect(ctx.directory.listSentientSimsDbUnsaved()).toHaveLength(3);

    ctx.db.loadDatabase({
      sessionId: '718297398',
      saveId: '2',
    });
    // Loading a new session closes the previous db, checkpointing away its -wal/-shm files,
    // so the old session leaves only its .db behind until cleanup removes it
    expect(ctx.directory.listSentientSimsDbUnsaved()).toHaveLength(4);
    await ctx.db.saveDatabase({
      sessionId: '718297398',
      saveId: '2',
    });
    expect(ctx.directory.listSentientSimsDbUnsaved()).toHaveLength(3);

    ctx.db.unloadDatabase();
    expect(ctx.directory.listSentientSimsDbUnsaved()).toHaveLength(0);
  });
});
