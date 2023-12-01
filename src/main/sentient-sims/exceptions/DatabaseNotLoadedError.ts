export class DatabaseNotLoadedError extends Error {
  constructor() {
    super('Database is not loaded yet!');
    Object.setPrototypeOf(this, DatabaseNotLoadedError.prototype);
    this.name = 'DatabaseNotLoadedError';
  }
}
