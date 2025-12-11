import log from 'electron-log';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { ApiContext } from './ApiContext';

export class Player2KeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Player2KeyNotSetError';
  }
}

interface Player2ChatCompletion {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
}

interface Player2ChatCompletionRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  response_format?: {
    type: string;
    json_schema?: {
      name: string;
      strict: boolean;
      schema: {
        type: string;
        additionalProperties: boolean;
        required: string[];
        properties: {
          choice: {
            type: string;
            description: string;
            enum: string[];
          };
        };
      };
    };
  };
}

interface Player2AppResponse {
  p2Key: string;
}

export class Player2Service implements GenerationService {
  private readonly ctx: ApiContext;
  private readonly baseURL = 'https://api.player2.game/v1/';
  private readonly gameClientId = '019adf52-ccda-7748-b8d0-4005c6bd828d'; // Sentient Sims game ID
  private readonly localAppPort = 4315;
  private cachedP2Key: string | null = null;
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000; // 60 seconds

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.startHealthCheckTimer();
  }

  serviceUrl(): string {
    return this.ctx.settings.player2Endpoint || this.baseURL;
  }

  // REMOVED: getPlayer2Model() - Player2 doesn't need model selection

  /**
   * Attempts to get Player2 API key through multiple authentication methods
   * 1. Manual API key from settings
   * 2. Automatic detection of Player2 App running locally
   */
  async getPlayer2Key(): Promise<string> {
    // Method 1: Check manual API key from settings
    const manualKey = this.ctx.settings.player2Key;
    if (manualKey && manualKey.trim()) {
      log.debug('Using manual Player2 key from settings');
      this.cachedP2Key = manualKey.trim();
      return this.cachedP2Key;
    }

    // Method 2: Check environment variable
    const envKey = process.env.PLAYER2_KEY;
    if (envKey) {
      log.debug('Using Player2 key from environment');
      this.cachedP2Key = envKey;
      return this.cachedP2Key;
    }

    // Method 3: Try to authenticate with local Player2 App
    try {
      const localKey = await this.authenticateWithLocalApp();
      if (localKey) {
        log.info('Successfully authenticated with local Player2 App');
        this.cachedP2Key = localKey;
        return this.cachedP2Key;
      }
    } catch (error) {
      log.debug('Failed to authenticate with local Player2 App:', error);
    }

    throw new Player2KeyNotSetError('No Player2 authentication available. Please set API key manually or ensure Player2 App is running.');
  }

  /**
   * Attempts to authenticate with locally running Player2 App
   */
  private async authenticateWithLocalApp(): Promise<string | null> {
    try {
      const response = await fetch(`http://localhost:${this.localAppPort}/v1/login/web/${this.gameClientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout for local requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        log.debug(`Local Player2 App authentication failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: Player2AppResponse = await response.json();
      
      if (data.p2Key) {
        log.info('Local Player2 App authentication successful');
        return data.p2Key;
      }

      return null;
    } catch (error) {
      // This is expected when Player2 App is not running
      log.debug('Local Player2 App not available:', error);
      return null;
    }
  }

  /**
   * Makes authenticated request to Player2 API
   */
  private async makeRequest(request: Player2ChatCompletionRequest): Promise<Player2ChatCompletion> {
    const apiKey = await this.getPlayer2Key();
    
    const response = await fetch(`${this.serviceUrl()}chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Player2 API error: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Clear cached key if unauthorized (might be expired)
      if (response.status === 401) {
        this.cachedP2Key = null;
        log.debug('Cleared cached Player2 key due to 401 error');
      }
      
      throw new Error(`Player2 API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Starts the health check timer to track usage every 60 seconds
   */
  private startHealthCheckTimer(): void {
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        log.debug('Health check failed:', error);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Performs health check to track usage (required every 60 seconds)
   */
  private async performHealthCheck(): Promise<void> {
    // Only perform health check if we have authentication
    if (!this.cachedP2Key && !this.ctx.settings.player2Key) {
      return;
    }

    try {
      const apiKey = await this.getPlayer2Key();
      
      const response = await fetch(`${this.serviceUrl()}health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        this.lastHealthCheck = Date.now();
        log.debug('Player2 health check successful');
      } else {
        log.debug(`Player2 health check failed: ${response.status}`);
      }
    } catch (error) {
      log.debug('Player2 health check error:', error);
    }
  }

  async healthCheck(apiKey?: string): Promise<{ status?: string; error?: string }> {
    try {
      // Test with provided API key or try to get one
      let testKey: string;
      
      if (apiKey) {
        testKey = apiKey;
      } else {
        testKey = await this.getPlayer2Key();
      }

      // Test with a simple health endpoint
      const response = await fetch(`${this.serviceUrl()}health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testKey}`,
        },
      });

      if (response.ok) {
        const authMethod = apiKey ? 'manual API key' : 
                          this.cachedP2Key === this.ctx.settings.player2Key ? 'manual API key' : 
                          'local Player2 App';
        
        return {
          status: `OK (authenticated via ${authMethod})`,
        };
      }

      return {
        error: `API responded with ${response.status}: ${response.statusText}`,
      };
    } catch (error: any) {
      log.error('Error testing Player2 API:', error);

      // Provide helpful error messages
      if (error.message.includes('Player2KeyNotSetError')) {
        return {
          error: 'No authentication available. Please set API key manually or ensure Player2 App is running.',
        };
      }

      return {
        error: `Connection failed: ${error.message}`,
      };
    }
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const completionRequest: Player2ChatCompletionRequest = {
      // REMOVED: model parameter - Player2 handles model selection automatically
      max_tokens: request.maxResponseTokens,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };

    // Player2 supports guided choice via response format (similar to OpenAI)
    if (request.guidedChoice) {
      completionRequest.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'thechoice',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['choice'],
            properties: {
              choice: {
                type: 'string',
                description: 'The choice',
                enum: request.guidedChoice,
              },
            },
          },
        },
      };
    }

    log.debug(`Player2 Request:\n${JSON.stringify(completionRequest, null, 2)}`);

    const result = await this.makeRequest(completionRequest);
    let text = this.getOutputFromGeneration(result);

    if (request.guidedChoice) {
      text = JSON.parse(text).choice.trim();
    }

    if (this.ctx.settings.localizationEnabled) {
      text = await this.translate(text, this.ctx.settings.localizationLanguage);
    }

    return {
      text,
      request,
    };
  }

  getOutputFromGeneration(generation: Player2ChatCompletion): string {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    log.error(`Output wasn't truthy from Player2 API:\n${JSON.stringify(generation)}`);
    throw new Error(`Output wasn't truthy from Player2 API ${output}`);
  }

  async translate(text: string, language: string): Promise<string> {
    const request: Player2ChatCompletionRequest = {
      // REMOVED: model parameter - Player2 handles this automatically
      messages: [
        {
          role: 'system',
          content: `Translate the user input from English to ${language}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    };
    
    const result = await this.makeRequest(request);
    return this.getOutputFromGeneration(result);
  }

  // MODIFIED: Return empty array to avoid model fetching entirely
  async getModels(): Promise<AIModel[]> {
    // Player2 handles model selection automatically, no need to fetch models
    log.debug('Player2 uses automatic model selection - skipping model fetch');
    return [];
  }
}