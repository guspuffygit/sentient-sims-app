/* eslint-disable max-classes-per-file,class-methods-use-this */
/* eslint-disable promise/always-return */
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';

export class NovelAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NovelAIKeyNotSetError';
  }
}

// Ban bracket generation, plus defaults
const badWordsList = [
  [3],
  [49356],
  [1431],
  [31715],
  [34387],
  [20765],
  [30702],
  [10691],
  [49333],
  [1266],
  [19438],
  [43145],
  [26523],
  [41471],
  [2936],
  [85, 85],
  [49332],
  [7286],
  [1115],
  [24],
];

// Used for phrase repetition penalty
const repPenaltyAllowList = [
  [
    49256, 49264, 49231, 49230, 49287, 85, 49255, 49399, 49262, 336, 333, 432,
    363, 468, 492, 745, 401, 426, 623, 794, 1096, 2919, 2072, 7379, 1259, 2110,
    620, 526, 487, 16562, 603, 805, 761, 2681, 942, 8917, 653, 3513, 506, 5301,
    562, 5010, 614, 10942, 539, 2976, 462, 5189, 567, 2032, 123, 124, 125, 126,
    127, 128, 129, 130, 131, 132, 588, 803, 1040, 49209, 4, 5, 6, 7, 8, 9, 10,
    11, 12,
  ],
];

type LogitBiasExp = {
  sequence: number[];
  bias: number;
  ensure_sequence_finish: boolean;
  generate_once: boolean;
};

type NovelAIQueryParameters = {
  use_string: boolean;
  temperature: number;
  max_length: number;
  min_length: number;
  top_k: number;
  top_p: number;
  top_a: number;
  tail_free_sampling: number;
  repetition_penalty: number;
  repetition_penalty_range: number;
  repetition_penalty_slope: number;
  repetition_penalty_frequency: number;
  repetition_penalty_presence: number;
  phrase_rep_pen: 'aggressive';
  bad_words_ids: number[][];
  repetition_penalty_whitelist: number[][];
  stop_sequences: number[][];
  generate_until_sentence: boolean;
  use_cache: boolean;
  return_full_text: boolean;
  prefix: string;
  logit_bias_exp: LogitBiasExp[];
  // order: number[];
};

type NovelAIRequest = {
  input: string;
  model: string;
  parameters: NovelAIQueryParameters;
};

// Ban the dinkus and asterism
const logitBiasExp: LogitBiasExp[] = [
  {
    sequence: [23],
    bias: -0.08,
    ensure_sequence_finish: false,
    generate_once: false,
  },
  {
    sequence: [21],
    bias: -0.08,
    ensure_sequence_finish: false,
    generate_once: false,
  },
];

type NovelAISubscription = {
  tier?: number;
  active?: boolean;
  expiresAt?: number;
  perks?: {
    contextTokens?: number;
  };
};

type NovelAIError = {
  status?: number;
  message?: string;
};

type NovelAIGenerateResponse = {
  output?: string;
  error?: string;
  statusCode?: number;
  message?: string;
};

export class NovelAIService implements GenerationService {
  private readonly settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(SettingsEnum.NOVELAI_ENDPOINT) as string;
  }

  getNovelAIKey(): string | undefined {
    // Check app settings
    const novelAIKeyFromSettings = this.settingsService.get(
      SettingsEnum.NOVELAI_KEY
    );
    if (novelAIKeyFromSettings) {
      log.debug('Using novelai key from settings');
      return novelAIKeyFromSettings as string;
    }

    throw new NovelAIKeyNotSetError(
      'No NovelAI Key set, Edit NovelAI Key to set it'
    );
  }

  async healthCheck(apiKey?: string) {
    const key = apiKey ?? this.getNovelAIKey();

    log.info(`${this.serviceUrl()}/user/subscription`);

    const response = await fetch(`${this.serviceUrl()}/user/subscription`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.ok) {
      const subscription: NovelAISubscription = await response.json();
      log.info(`data: ${JSON.stringify(subscription, null, 2)}`);
      return {
        status: `Subscription ${subscription.active}, Max Context ${subscription?.perks?.contextTokens}, Tier ${subscription.tier}`,
      };
    }

    try {
      const novelAIError: NovelAIError = await response.json();
      if (novelAIError.message) {
        return {
          status: `NovelAI Error: ${novelAIError.message}`,
        };
      }
    } catch (err: any) {
      // ignore
    }

    return {
      status: 'Not working..',
    };
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = request.messages.map((m) => m.content).join('\n');
    log.debug(`prompt: ${JSON.stringify(prompt)}`);

    const novelAIRequest: NovelAIRequest = {
      input: prompt,
      model: 'kayra-v1',
      parameters: {
        use_string: true,
        temperature: 1.35,
        max_length: request.maxResponseTokens,
        min_length: 1,
        top_k: 15,
        top_p: 0.85,
        top_a: 0.1,
        tail_free_sampling: 0.915,
        repetition_penalty: 2.8,
        repetition_penalty_range: 2048,
        repetition_penalty_slope: 0.02,
        repetition_penalty_frequency: 0.02,
        repetition_penalty_presence: 0,
        phrase_rep_pen: 'aggressive',
        bad_words_ids: badWordsList,
        repetition_penalty_whitelist: repPenaltyAllowList,
        stop_sequences: [[43145], [19438]],
        generate_until_sentence: true,
        use_cache: false,
        return_full_text: false,
        prefix: 'special_instruct',
        logit_bias_exp: logitBiasExp,
      },
    };

    const url = `${this.serviceUrl()}/ai/generate`;
    const authHeader = `${this.settingsService.get(SettingsEnum.NOVELAI_KEY)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(novelAIRequest),
    });

    const result: NovelAIGenerateResponse = await response.json();

    if (result.output) {
      return {
        text: result.output.trim(),
        request,
      };
    }

    log.error(`Error generating via novelai`, result);
    return {
      text: 'Error generating via novelai',
      request,
    };
  }

  async getModels(): Promise<AIModel[]> {
    return [
      {
        name: 'kayra-v1',
        displayName: 'kayra-v1',
      },
    ];
  }
}
