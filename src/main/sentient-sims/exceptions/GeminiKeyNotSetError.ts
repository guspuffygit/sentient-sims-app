export class GeminiKeysNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiKeysNotSetError';
  }
}
