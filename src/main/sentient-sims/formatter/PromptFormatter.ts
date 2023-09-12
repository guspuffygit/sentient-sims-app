export function removeLastParagraph(text: string): string {
  const paragraphs = text.split('\n');

  if (paragraphs.length > 2) {
    paragraphs.pop();
  }

  return paragraphs.join('\n').trim();
}

export function trimIncompleteSentence(text: string): string {
  const lastPunctIndex = Math.max(
    text.lastIndexOf('.'),
    text.lastIndexOf('?'),
    text.lastIndexOf('!')
  );

  if (lastPunctIndex >= 0) {
    return text.substring(0, lastPunctIndex + 1);
  }

  return text;
}

export function formatWantsOutput(preResponse: string, text: string): string {
  let output = text;
  if (output.includes('I would')) {
    output = output.split('I would', 2)[1].trim();
  }
  if (output.startsWith(preResponse)) {
    return output;
  }

  return [preResponse.trim(), output].join(' ');
}
