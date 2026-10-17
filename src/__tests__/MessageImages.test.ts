import { withoutImageData } from 'main/sentient-sims/models/OpenAIMessage';

describe('withoutImageData', () => {
  it('keeps a count in place of the image data, and leaves a request without images as it is', () => {
    const plain = { messages: [{ role: 'user' as const, content: 'hi', tokens: 1 }] };
    expect(withoutImageData(plain)).toBe(plain);

    const withImages = {
      messages: [
        { role: 'user' as const, content: 'Facts', tokens: 1, images: [{ mimeType: 'image/jpeg', data: 'x' }] },
      ],
    };
    expect(withoutImageData(withImages).messages).toEqual([
      { role: 'user', content: 'Facts\n[1 image(s) attached]', tokens: 1 },
    ]);
    expect(withImages.messages[0].images).toHaveLength(1);
  });
});
