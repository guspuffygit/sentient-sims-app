import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { mockApiContext } from './util';

const transcriptPath =
  'C:\\Users\\scott\\AppData\\Local\\Temp\\claude\\c--Users-scott-Documents-github-sentient-sims-app\\4c0921ac-38ab-40eb-866a-0b85e8988dd1\\scratchpad\\directed-scene-transcript.txt';

// Number of continuation scenes to run after the initial scene. Override via:
//   SCENE_CONTINUATIONS=5 cross-env NODE_ENV=test ... vitest run DirectedSceneScratch
const continuationCount = Number(process.env.SCENE_CONTINUATIONS ?? 1);

function buildEvent(testingAction?: string): InteractionEvent {
  return {
    location_id: 0,
    sentient_sims: [
      {
        careers: [{ name: 'career_Adult_Criminal', level: 3, track_name: 'Criminal_Track1' }],
        name: 'Ricky Rickerson',
        age: SimAge.ADULT,
        sim_id: '772948625141858300',
        gender: 'Male',
        traits: ['trait_Evil', 'trait_Glutton', 'trait_CommitmentIssues'],
        moods: ['Mood_Confident'],
        is_ghost: false,
        grubby: false,
        in_pool: false,
        is_at_home: true,
        is_dying: false,
        is_human: true,
        is_inside_building: false,
        is_outside: true,
        is_pet: false,
        on_fire: false,
        on_home_lot: true,
        sleeping: false,
        is_pregnant: false,
        is_player_sim: true,
      },
      {
        careers: [
          {
            name: 'careers_Adult_SocialMedia',
            level: 9,
            track_name: 'careerTrack_SocialMedia_Track2_InternetPersonality',
          },
        ],
        name: 'Richy Richardson',
        age: SimAge.ADULT,
        sim_id: '772949305175180300',
        gender: 'Male',
        traits: ['trait_Ambitious', 'trait_Romantic', 'trait_Outgoing'],
        moods: ['Mood_Happy'],
        is_ghost: false,
        grubby: false,
        in_pool: false,
        is_at_home: false,
        is_dying: false,
        is_human: true,
        is_inside_building: false,
        is_outside: false,
        is_pet: false,
        on_fire: false,
        on_home_lot: false,
        sleeping: false,
        is_pregnant: false,
        is_player_sim: false,
      },
    ],
    event_id: crypto.randomUUID(),
    event_type: SSEventType.INTERACTION,
    testing_action: testingAction,
    relationships: { relationship_bits: [] },
    environment: {
      location_id: 2891968416,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 18, day: 2, week: 1 },
    },
    interaction_name: 'scratch_directed_scene_test',
  };
}

describe('Directed scene scratch (live)', () => {
  it('runs a sitcom scene and a continue through the subtitle pipeline', async () => {
    const configPath = `${process.env.APPDATA}\\sentient-sims-app\\config.json`;
    let openaiKey = process.env.OPENAI_KEY;
    let openaiModel: string | undefined;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as {
        openaiKey?: string;
        openaiModel?: string;
      };
      openaiKey = openaiKey ?? config.openaiKey;
      openaiModel = config.openaiModel;
    }
    if (!openaiKey) {
      console.log('No OpenAI key available, skipping live directed scene test');
      return;
    }

    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'scratch-session', saveId: '1' });
    ctx.settings.openaiKey = openaiKey;
    ctx.settings.aiApiType = ApiType.OpenAI;
    if (openaiModel) ctx.settings.openaiModel = openaiModel;

    const transcript: string[] = [];

    // Scene 1: fresh scene from an interaction action
    const result1 = await ctx.ai.runDirectedScene({
      event: buildEvent(
        'Ricky Rickerson is pitching Richy Richardson on his latest get-rich-quick scheme, certain this one cannot fail.',
      ),
    });
    transcript.push('=== SCENE 1 (fresh) ===');
    result1.exchanges?.forEach((exchange) => {
      transcript.push(`--- ${exchange.label} ---`);
      transcript.push(exchange.responseText);
      transcript.push('');
    });
    transcript.push('--- FINAL TEXT SENT TO GAME ---');
    transcript.push(result1.text ?? '(none)');
    transcript.push('');

    expect(result1.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result1.text).toContain('Ricky Rickerson:');
    expect(result1.text).toContain('Richy Richardson:');
    // Pure subtitles: no quoted screenplay dialogue, no parenthetical delivery notes
    expect(result1.text).not.toContain('"');
    expect(result1.text).not.toMatch(/: \(/);

    // Scenes 2..N: continue — must pick up mid-flow, not replay the beat
    for (let scene = 2; scene <= continuationCount + 1; scene += 1) {
      const result = await ctx.ai.runDirectedScene({
        event: buildEvent(undefined),
        continueScene: true,
      });
      transcript.push(`=== SCENE ${scene} (continue) ===`);
      result.exchanges?.forEach((exchange) => {
        transcript.push(`--- ${exchange.label} ---`);
        transcript.push(exchange.responseText);
        transcript.push('');
      });
      transcript.push('--- FINAL TEXT SENT TO GAME ---');
      transcript.push(result.text ?? '(none)');
      transcript.push('');

      expect(result.status).toEqual(InteractionEventStatus.GENERATED);
      expect(result.text).toContain('Ricky Rickerson:');
      expect(result.text).toContain('Richy Richardson:');
    }

    fs.writeFileSync(transcriptPath, transcript.join('\n'));
  }, 600000);
});
