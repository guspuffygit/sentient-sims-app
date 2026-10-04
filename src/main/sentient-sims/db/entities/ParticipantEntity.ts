export type ParticipantEntity = {
  id: bigint;
  description?: string;
  name?: string;
  // 1 when the app wrote the description itself, so it may be cleared and rewritten when
  // the sim changes. Never set for a description a person typed (Phase 3.1 fix B).
  description_generated?: number;
};
