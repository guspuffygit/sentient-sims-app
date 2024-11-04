export function filterNullAndUndefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item != null);
}

export function removeEmojis(text: string): string {
  return text.replace(
    /[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g,
    ''
  );
}

export function removeNonPrintableCharacters(text: string): string {
  return text.replace(/[^a-zA-Z0-9.,+-]/g, '');
}
