export type PaintingEntity = {
  uuid: string;
  // 64-bit SSLocalWork texture instance id as a 16-char lowercase hex string;
  // stored as text because the value does not fit in a JS number
  instance_id: string;
  prompt?: string;
  // Master PNG artwork; the mod's loose DDS file is a cache rebuilt from this
  image?: Buffer;
  metadata?: string;
  created_at?: string;
};
