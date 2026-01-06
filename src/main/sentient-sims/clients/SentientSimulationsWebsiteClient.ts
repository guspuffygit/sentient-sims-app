import { ThankYou } from 'renderer/hooks/useThankYous';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class SentientSimulationsWebsiteClient extends ApiClient {
  async getThankYous(): Promise<ThankYou> {
    const response = await axiosClient.get<ThankYou>('https://www.sentientsimulations.com/thankyou.json', {
      headers: {
        'cache-control': 'no-cache',
      },
    });
    return response.data;
  }
}
