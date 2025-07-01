/* eslint-disable no-console */
import '@testing-library/jest-dom';
import {
  InteractionEvent,
  SSEventType,
} from 'main/sentient-sims/models/InteractionEvents';
import * as fs from 'fs';
import { DbService } from 'main/sentient-sims/services/DbService';
import { ParticipantRepository } from 'main/sentient-sims/db/ParticipantRepository';
import { LocationRepository } from 'main/sentient-sims/db/LocationRepository';
import { MemoryRepository } from 'main/sentient-sims/db/MemoryRepository';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import {
  BodyState,
  cleanupAIOutput,
  formatListToString,
  formatWWProperties,
  hasWWProperties,
} from 'main/sentient-sims/formatter/PromptFormatter';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { RepositoryService } from 'main/sentient-sims/services/RepositoryService';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { OpenAITokenCounter } from 'main/sentient-sims/tokens/OpenAITokenCounter';
import {
  OpenAIRequestBuilder,
  PromptRequest,
} from 'main/sentient-sims/models/OpenAIRequestBuilder';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { mockDirectoryService } from './util';

describe('Output', () => {
  it('cleanup', () => {
    expect(cleanupAIOutput('output')).toEqual('output');

    const actual = 'This is a sentence. Here is another';
    const expected = 'This is a sentence.';
    expect(cleanupAIOutput(actual)).toEqual(expected);
  });

  describe('Event Formatter', () => {
    it('test', async () => {
      const event: InteractionEvent = {
        // TODO: Deprecated
        location_id: 0,
        sentient_sims: [
          {
            careers: [
              {
                name: 'career_Adult_Criminal',
                level: 3,
                track_name: 'Criminal_Track1',
              },
            ],
            name: 'Ricky Rickerson',
            age: SimAge.ADULT,
            sim_id: '772948625141858300',
            gender: 'Male',
            traits: [
              'trait_SimPreference_Likes_Activities_RocketScience',
              'trait_SimPreference_Likes_Activities_Fitness',
              'trait_Evil',
              'trait_Glutton',
              'trait_CommitmentIssues',
            ],
            moods: ['Mood_Flirty'],
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
                track_name:
                  'careerTrack_SocialMedia_Track2_InternetPersonality',
              },
            ],
            name: 'Richy Richardson',
            age: SimAge.ADULT,
            sim_id: '772949305175180300',
            gender: 'Male',
            traits: [
              'trait_SimPreference_Likes_Color_Green',
              'trait_SimPreference_Dislikes_Music_Pop',
              'trait_SimPreference_Dislikes_Activities_VideoGaming',
              'trait_Ambitious',
              'trait_Romantic',
              'trait_Outgoing',
            ],
            moods: ['Mood_Flirty'],
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
        event_id: '2daaac8e-bd86-4afe-a9f8-60cf3132e057',
        event_type: SSEventType.INTERACTION,
        relationships: {
          relationship_bits: [],
        },
        environment: {
          location_id: 2891968416,
          world_id: 0,
          time: {
            second: 0,
            minute: 0,
            hour: 0,
            day: 0,
            week: 0,
          },
        },
        interaction_name:
          'mixer_social_ShareFishingTips_targeted_Friendly_alwaysOn_skills',
      };

      const directoryService = mockDirectoryService();
      fs.mkdirSync(directoryService.getSentientSimsFolder(), {
        recursive: true,
      });
      const dbService = new DbService(directoryService);
      await dbService.loadDatabase({
        sessionId: '958127321',
        saveId: '2',
      });
      const repositoryService = new RepositoryService(
        new LocationRepository(dbService),
        new MemoryRepository(dbService),
        new ParticipantRepository(dbService),
      );
      const promptRequestBuilderService = new PromptRequestBuilderService(
        repositoryService,
      );

      const result = await promptRequestBuilderService.buildPromptRequest(
        event,
        {
          action:
            '{actor.0} and {actor.1} are having a friendly conversation, sharing fishing tips.',
          apiType: ApiType.SentientSimsAI,
          modelSettings: {
            temperature: undefined,
            top_p: undefined,
            top_k: undefined,
            repetition_penalty: undefined,
            max_tokens: 5000,
          },
        },
      );

      console.log(JSON.stringify(result, null, 2));

      expect(result?.action).toEqual(
        'Ricky Rickerson and Richy Richardson are having a friendly conversation, sharing fishing tips.',
      );

      // System prompt should contain sim names for an interaction
      expect(result.systemPrompt).toContain('Richy Richardson');
      expect(result.systemPrompt).toContain('Ricky Rickerson');
    });
  });

  describe('formatListToString', () => {
    it('zero item list', () => {
      expect(formatListToString([])).toEqual('');
    });

    it('one item', () => {
      expect(formatListToString(['hello'])).toEqual('hello');
    });

    it('two items', () => {
      expect(formatListToString(['hello', 'hi'])).toEqual('hello and hi');
    });

    it('three items', () => {
      expect(formatListToString(['hello', 'hi', 'how'])).toEqual(
        'hello, hi, and how',
      );
    });
  });

  describe('formatting', () => {
    let sentientSim: SentientSim;

    beforeEach(() => {
      sentientSim = {
        careers: [],
        name: '',
        age: SimAge.ADULT,
        sim_id: '',
        gender: '',
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
    });

    it('hasWWProperties', () => {
      expect(hasWWProperties(sentientSim)).toBeFalsy();

      sentientSim.upper_body = 3;
      expect(hasWWProperties(sentientSim)).toBeFalsy();

      sentientSim.lower_body = 2;
      expect(hasWWProperties(sentientSim)).toBeTruthy();
    });

    it('completelyNaked', () => {
      sentientSim.upper_body = BodyState.NUDE;
      sentientSim.lower_body = BodyState.NUDE;
      expect(formatWWProperties(sentientSim)).toEqual(
        `${sentientSim.name} is completely naked.`,
      );
    });
  });

  describe('OpenAIRequestBuilder', () => {
    const builder = new OpenAIRequestBuilder(new OpenAITokenCounter());
    let request: PromptRequest;
    beforeEach(() => {
      request = {
        location: 'location',
        participants: 'sim 1',
        season: 'Eternal Summer',
        systemPrompt: 'system',
        memories: [
          {
            content: 'Give me A',
            role: 'user',
          },
          {
            content: 'A',
            role: 'assistant',
          },
          {
            content: 'Give me B',
            role: 'user',
          },
          {
            content: 'B',
            role: 'assistant',
          },
        ],
        dateTime: 'The day is Monday at 7:51 AM.',
        maxResponseTokens: 100,
        maxTokens: 3000,
        action: 'action',
        assistantPreResponse: 'assistantPreResponse',
      };
    });

    it('buildOpenAIRequest everything', () => {
      const result = builder.buildOpenAIRequest(request);

      expect(result.messages[0].content).toContain('location');
      expect(result.messages[0].content).toContain('sim 1');
      expect(result.messages[0].content).toContain('system');
      expect(result.messages[0].content).toContain(
        'The day is Monday at 7:51 AM.',
      );
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[0].tokens).toBeGreaterThan(5);

      expect(result.messages[1].content).toBe('Give me A');
      expect(result.messages[1].role).toBe('user');

      expect(result.messages[2].content).toBe('A');
      expect(result.messages[2].role).toBe('assistant');

      expect(result.messages[3].content).toBe('Give me B');
      expect(result.messages[3].role).toBe('user');

      expect(result.messages[4].content).toBe('B');
      expect(result.messages[4].role).toBe('assistant');

      expect(result.messages[5].content).toBe('action');
      expect(result.messages[5].role).toBe('user');

      expect(result.messages[6].content).toBe('assistantPreResponse');
      expect(result.messages[6].role).toBe('assistant');
      let tokenCount = 0;
      result.messages.forEach((message) => {
        tokenCount += message.tokens;
      });
      console.log(`Tokens: ${tokenCount}`);
    });

    it('buildOpenAIRequest test length', () => {
      request.maxTokens = 60;
      const result = builder.buildOpenAIRequest(request);

      expect(result.messages[0].content).toContain('location');
      expect(result.messages[0].content).toContain('sim 1');
      expect(result.messages[0].content).toContain('system');
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[0].tokens).toBeGreaterThan(5);
      console.log(
        `THIS IS IT SEARCH FOR THIS: ${JSON.stringify(result, null, 2)}`,
      );
      expect(result.messages[1].content).toBe('A');
      expect(result.messages[1].role).toBe('assistant');

      expect(result.messages[2].content).toBe('Give me B');
      expect(result.messages[2].role).toBe('user');

      expect(result.messages[3].content).toBe('B');
      expect(result.messages[3].role).toBe('assistant');

      expect(result.messages[4].content).toBe('action');
      expect(result.messages[4].role).toBe('user');

      expect(result.messages[5].content).toBe('assistantPreResponse');
      expect(result.messages[5].role).toBe('assistant');
    });
  });
});
