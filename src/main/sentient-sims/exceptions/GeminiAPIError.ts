export class GeminiAPIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}
