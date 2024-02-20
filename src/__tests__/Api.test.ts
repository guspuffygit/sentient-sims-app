/* eslint-disable no-console */
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import '@testing-library/jest-dom';
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
import { mockEnvironment } from './util';

describe('Api', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAssetPath = (...paths: string[]) => {
    return '';
  };
  const { directoryService, settingsService } = mockEnvironment();
  const apiOptions = {
    getAssetPath,
    port: 25198,
    settingsService,
    directoryService,
  };
  const apiUrl = `http://localhost:${apiOptions.port}`;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(() => {
    server = runApi(apiOptions);
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
    const files = fs.readdirSync(directoryService.getSentientSimsFolder());
    expect(files.length).toBeGreaterThan(2);
    expect(files).toContain('sentient-sims.package');
  });

  it('version controller', async () => {
    fs.mkdirSync(directoryService.getSentientSimsFolder(), { recursive: true });
    const expectedVersion: Version = { version: 'expectedversion' };
    fs.writeFileSync(
      directoryService.getModVersionFile(),
      JSON.stringify(expectedVersion)
    );

    const versionClient = new VersionClient(apiUrl);
    const modVersion = await versionClient.getModVersion();
    console.log(modVersion.version);
    expect(modVersion.version).toEqual(expectedVersion.version);
  });

  it('interaction controller', async () => {
    const dbClient = new DbClient(apiUrl);
    await dbClient.loadDatabase('81726387641');
    const aiClient = new AIClient(apiUrl);
    const sentientSim: SentientSim = {
      careers: [],
      name: 'Gus Puffy',
      age: 30,
      sim_id: '192837876',
      gender: 'Male',
      likes: [],
      dislikes: [],
      aspirations: [],
      moods: [],
      motives: [],
      personality_traits: [],
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

    expect(result.text).toContain('I want to');
  }, 30000);
});
