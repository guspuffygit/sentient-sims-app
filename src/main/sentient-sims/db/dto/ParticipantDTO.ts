export type ParticipantDTO = {
  id: string;
  description?: string;
  name?: string;
  // ElevenLabs voice override. Empty/undefined means fall back to automatic voice
  // casting. The id is what drives playback so a voice keeps working after the user
  // removes it from their My Voices collection; the name is only kept for display.
  voiceId?: string;
  voiceName?: string;
};
