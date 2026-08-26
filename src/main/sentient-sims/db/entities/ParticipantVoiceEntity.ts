export type ParticipantVoiceEntity = {
  participant_id: bigint;
  voice_type: string;
  voice_id?: string | null;
  voice_name?: string | null;
};
