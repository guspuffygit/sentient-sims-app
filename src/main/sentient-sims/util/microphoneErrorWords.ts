// What went wrong with the microphone, in words a player can act on. `name` is the
// DOMException name getUserMedia rejected with; the sentence is shown in the game and the app.
export function microphoneErrorWords(name: string | undefined, message: string, isMac: boolean): string {
  switch (name) {
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone detected. Plug one in, then check Settings > Voice in the Sentient Sims app.';
    case 'OverconstrainedError':
      return 'The microphone chosen in the Sentient Sims app is not connected. Pick another under Settings > Voice.';
    case 'NotAllowedError':
    case 'SecurityError':
      return isMac
        ? 'Sentient Sims is not allowed to use the microphone. Allow it in System Settings > Privacy & Security > Microphone.'
        : 'Sentient Sims is not allowed to use the microphone. Allow it in Windows Settings > Privacy & security > Microphone.';
    case 'NotReadableError':
    case 'AbortError':
      return 'The microphone could not be opened. Another program may be using it.';
    default:
      return `The microphone did not work: ${message}`;
  }
}
