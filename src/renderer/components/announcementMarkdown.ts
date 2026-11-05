export type InlineSegment =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string }
  | { type: 'bold'; children: InlineSegment[] }
  | { type: 'link'; children: InlineSegment[]; url: string };

const INLINE = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInlineMarkdown(input: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(INLINE)) {
    const [, code, bold, linkText, url] = match;
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: input.slice(lastIndex, match.index) });
    }

    if (code) {
      segments.push({ type: 'code', content: code });
    } else if (bold) {
      segments.push({ type: 'bold', children: parseInlineMarkdown(bold) });
    } else {
      segments.push({ type: 'link', children: parseInlineMarkdown(linkText), url });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ type: 'text', content: input.slice(lastIndex) });
  }

  return segments;
}
