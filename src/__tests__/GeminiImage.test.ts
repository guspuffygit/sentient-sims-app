import { Modality } from '@google/genai';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { geminiDefaultImageModel } from 'main/sentient-sims/constants';

type GenerateContentRequest = {
  model: string;
  config?: { responseModalities?: string[] };
  contents: unknown;
};

type GenerateContentResponse = {
  candidates?: { content?: { parts?: { text?: string; inlineData?: { data?: string; mimeType?: string } }[] } }[];
};

const generateContentCalls: GenerateContentRequest[] = [];
let respond: (request: GenerateContentRequest) => Promise<GenerateContentResponse>;

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  GoogleGenAI: class {
    models = {
      generateContent: (request: GenerateContentRequest) => {
        generateContentCalls.push(request);
        return respond(request);
      },
    };
  },
}));

// Imported after the mock so the service picks up the fake Gemini client
const { mockApiContext } = await import('./util');

describe('Gemini image generation', () => {
  const imageResponse: GenerateContentResponse = {
    candidates: [
      {
        content: {
          parts: [{ text: 'Here is your painting' }, { inlineData: { data: 'imagebytes', mimeType: 'image/png' } }],
        },
      },
    ],
  };

  beforeEach(() => {
    generateContentCalls.length = 0;
    respond = () => Promise.resolve(imageResponse);
  });

  function imageService() {
    const ctx = mockApiContext();
    ctx.settings.geminiKeys = 'key1';
    return ctx.getImageGenerationService(ApiType.Gemini);
  }

  it('requests the IMAGE modality and returns the inlineData base64', async () => {
    const response = await imageService().generateImage({ prompt: 'a cat', model: 'gemini-3-pro-image' });

    expect(response.imageBase64).toEqual('imagebytes');
    expect(response.model).toEqual('gemini-3-pro-image');
    expect(response.apiType).toEqual(ApiType.Gemini);

    expect(generateContentCalls).toHaveLength(1);
    const request = generateContentCalls[0];
    expect(request.model).toEqual('gemini-3-pro-image');
    expect(request.contents).toEqual('a cat');
    expect(request.config?.responseModalities).toEqual([Modality.IMAGE, Modality.TEXT]);
  });

  it('defaults the model when the request pins none', async () => {
    await imageService().generateImage({ prompt: 'a cat' });

    expect(generateContentCalls[0].model).toEqual(geminiDefaultImageModel);
  });

  it('throws when the response has no image part', async () => {
    respond = () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'no image, sorry' }] } }] });

    await expect(imageService().generateImage({ prompt: 'a cat' })).rejects.toThrow(
      'No image data returned from Gemini',
    );
    // A missing image is a model refusal, not a transient failure: no retry
    expect(generateContentCalls).toHaveLength(1);
  });

  it('surfaces the error after exhausting retries', async () => {
    respond = () => Promise.reject(new Error('boom'));

    await expect(imageService().generateImage({ prompt: 'a cat' })).rejects.toThrow('boom');
    expect(generateContentCalls).toHaveLength(3);
  });
});
