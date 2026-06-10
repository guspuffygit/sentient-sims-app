import { runApi } from 'main/sentient-sims/api';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SettingsClient } from 'main/sentient-sims/clients/SettingsClient';
import { mockApiContext } from './util';

describe('ApiIT', () => {
  const ctx = mockApiContext();
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

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

  it('test sentientsims ai', async () => {
    const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
    const command = new AdminInitiateAuthCommand({
      UserPoolId: 'us-east-1_qRTW6SLkg', // Cognito User Pool ID
      ClientId: '48v8v7im7orq9e8ik9us1cpd60', // App Client ID (no secret required)
      AuthFlow: 'ADMIN_NO_SRP_AUTH', // Authentication flow
      AuthParameters: {
        USERNAME: process.env.SENTIENTSIMS_TEST_USER as string,
        PASSWORD: process.env.SENTIENTSIMS_TEST_PASSWORD as string,
      },
    });
    const adminAuthResponse = await client.send(command);

    const jwtToken = adminAuthResponse.AuthenticationResult?.IdToken || '';
    const settingsClient = new SettingsClient(apiUrl);
    await settingsClient.updateSetting(SettingsEnum.ACCESS_TOKEN, jwtToken);
    await settingsClient.updateSetting(SettingsEnum.AI_API_TYPE, ApiType.SentientSimsAI);
    const aiClient = new AIClient(apiUrl);
    const models = await aiClient.getModels();
    expect(models[0].name).toEqual('Gryphe/MythoMax-L2-13b');
  });
});
