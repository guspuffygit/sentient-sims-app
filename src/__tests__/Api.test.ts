import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { runApi } from 'main/sentient-sims/api';
import * as fs from 'fs';
import { Version } from 'main/sentient-sims/services/VersionService';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { UpdateClient } from 'main/sentient-sims/clients/UpdateClient';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { DbClient } from 'main/sentient-sims/clients/DbClient';
import { DatabaseSession } from 'main/sentient-sims/models/DatabaseSession';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { defaultWantsPrefixes } from 'main/sentient-sims/constants';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SettingsClient } from 'main/sentient-sims/clients/SettingsClient';
import { mockApiContext } from './util';

describe('Api', () => {
  const ctx = mockApiContext();
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: any) => {
        if (err) {
          console.error('Error', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('update controller', async () => {
    const updateClient = new UpdateClient(apiUrl);
    const credentials = await defaultProvider()();
    await updateClient.updateMod({
      type: 'main',
      credentials,
    });
    const files = fs.readdirSync(ctx.directory.getSentientSimsFolder());
    expect(files.length).toBeGreaterThan(2);
    expect(files).toContain('sentient-sims.package');
  });

  it('version controller', async () => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    const expectedVersion: Version = { version: 'expectedversion' };
    fs.writeFileSync(ctx.directory.getModVersionFile(), JSON.stringify(expectedVersion));

    const versionClient = new VersionClient(apiUrl);
    const modVersion = await versionClient.getModVersion();
    console.log(modVersion.version);
    expect(modVersion.version).toEqual(expectedVersion.version);
  });

  it('interaction controller', async () => {
    const dbClient = new DbClient(apiUrl);
    const databaseSession: DatabaseSession = {
      sessionId: '81726387641',
      saveId: '2',
    };
    await dbClient.loadDatabase(databaseSession);
    const aiClient = new AIClient(apiUrl);
    const sentientSim: SentientSim = {
      careers: [],
      name: 'Gus Puffy',
      age: SimAge.ADULT,
      sim_id: '192837876',
      gender: 'Male',
      moods: [],
      traits: [],
      is_ghost: false,
      grubby: false,
      in_pool: false,
      is_at_home: false,
      is_dying: false,
      is_human: false,
      is_inside_building: false,
      is_outside: false,
      is_pet: false,
      on_fire: false,
      on_home_lot: false,
      sleeping: false,
      is_pregnant: false,
      is_player_sim: true,
    };
    const result = await aiClient.interactionEvent({
      event_id: 'oiju981y28hdo1ij',
      event_type: SSEventType.WANTS,
      location_id: 0,
      sentient_sims: [sentientSim],
      relationships: {
        relationship_bits: [],
      },
      environment: {
        location_id: 0,
        world_id: 0,
        time: {
          second: 0,
          minute: 0,
          hour: 0,
          day: 0,
          week: 0,
        },
      },
    });

    const containsWantPrefix = defaultWantsPrefixes.some((want) => result.text?.includes(want));

    expect(containsWantPrefix).toBeTruthy();
  }, 30000);

  it('test settings api', async () => {
    const settingsClient = new SettingsClient(apiUrl);
    await settingsClient.updateSetting(SettingsEnum.LOCALIZATION_ENABLED, true);
    const result = await settingsClient.getSetting(SettingsEnum.LOCALIZATION_ENABLED);
    expect(result.value).toBeTruthy();
  }, 30000);
});
