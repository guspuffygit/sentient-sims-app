export function stringType(value: unknown): value is string {
  return typeof value === 'string';
}
