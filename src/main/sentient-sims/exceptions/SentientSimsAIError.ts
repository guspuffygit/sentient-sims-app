export class SentientSimsAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SentientSimsAIError';
  }
}
