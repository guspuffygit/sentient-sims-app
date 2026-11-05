export type MembershipSource = 'stripe' | 'patreon' | 'cognito' | 'founder' | 'dev' | 'api_key' | 'none';

export type UsageState = 'normal' | 'near' | 'extra' | 'stopped';

export type Lane = 'fast' | 'slow';

// Stripe sells tier1 and tier2; tier3 and tier4 are Patreon only
export type Tier = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export type MembershipUsage = {
  percent: number;
  state: UsageState;
  extraUsd: number;
};

// The membership block of GET /me and the answer of PUT /billing/settings
export type MembershipInfo = {
  member: boolean;
  source: MembershipSource;
  tier?: string;
  status?: string;
  founder: boolean;
  // A founder without a plan, who may use the Sentient Sims worker models only
  workerOnly?: boolean;
  dev: boolean;
  // Tier 3, Tier 4 and devs may speak through ElevenLabs on Sentient Sims AI
  elevenLabs?: boolean;
  priceUsd: number;
  includedUsd: number;
  bonusMultiplier?: number;
  bonusUntil?: string;
  extraEnabled: boolean;
  extraLimitUsd: number;
  lane: Lane;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
  usage: MembershipUsage;
};

export type UserInfo = {
  displayName?: string;
  id?: string;
  membership?: MembershipInfo;
};

export type BillingSettingsRequest = {
  extraEnabled: boolean;
  extraLimitUsd: number;
  lane: Lane;
};

// One Stripe plan from GET /billing/plans, priced live from Stripe
export type Plan = {
  tier: Tier;
  priceUsd: number;
  includedUsd: number;
};

export type PlansResponse = {
  plans: Plan[];
};

export type CheckoutRequest = {
  tier: Tier;
  successUrl?: string;
  cancelUrl?: string;
};

export type PortalRequest = {
  returnUrl?: string;
};

export type BillingUrlResponse = {
  url: string;
};

// Cost relative to the base chat model (1x), never a dollar amount
export type ChatCost = {
  fast: number;
  // Only a model with a cheaper slow route carries one
  slow?: number;
};

export type RateCard = {
  as_of: string;
  base_chat: string;
  chat: { [model: string]: ChatCost };
  // Relative to the base chat model (1x), per token
  embeddings: { [model: string]: number };
  // Relative to Kokoro (1x)
  voices: { [model: string]: number };
};
