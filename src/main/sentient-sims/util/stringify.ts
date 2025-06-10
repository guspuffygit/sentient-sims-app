export function bigintReplacer(key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}
