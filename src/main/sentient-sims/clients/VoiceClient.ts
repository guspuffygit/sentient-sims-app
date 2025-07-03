import { ApiClient } from './ApiClient';

export class VoiceClient extends ApiClient {
  async phonemize(text: string, language: 'a' | 'b'): Promise<string> {
    const response = await fetch(
      `${this.apiUrl}/voice/phonemize?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}`,
    );
    return response.text();
  }
}
