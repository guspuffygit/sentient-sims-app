import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { AIModel } from '../models/AIModel';

export enum CognitoGroup {
  Mappers = 'mappers',
}

const SUBSCRIBER_TIERS = ['tier1', 'tier2', 'tier3', 'tier4'];

const TIER_2_ACCESS_TIERS = ['tier2', 'tier3', 'tier4'];

export const ELEVENLABS_TIERS = ['tier3', 'tier4'];

export class PatreonUser {
  private readonly userAttributes?: AuthUserAttributes;

  constructor(userAttributes?: AuthUserAttributes) {
    this.userAttributes = userAttributes;
  }

  getPatreonId() {
    return this.userAttributes?.patreonId;
  }

  getSubscriptionLevel() {
    if (this.userAttributes?.subscriptionLevel) {
      return this.userAttributes.subscriptionLevel;
    }

    return 'free';
  }

  getFounderStatus() {
    return this.userAttributes?.founderStatus;
  }

  isPatreonLinked() {
    return !!this.getPatreonId();
  }

  isFounder() {
    return this.getFounderStatus() === 'founder';
  }

  isDev() {
    const founderStatus = this.getFounderStatus();
    return founderStatus === 'dev';
  }

  getGroups(): string[] {
    return this.userAttributes?.groups ?? [];
  }

  isInGroup(group: CognitoGroup) {
    return this.getGroups().includes(group);
  }

  isMapper() {
    return this.isInGroup(CognitoGroup.Mappers);
  }

  isSubscriber() {
    return SUBSCRIBER_TIERS.includes(this.getSubscriptionLevel());
  }

  isMember() {
    return this.isFounder() || this.isSubscriber() || this.isDev();
  }

  // Tier 2 perks go to tier 2 and up and devs; founders and tier 1 see them locked
  hasTier2Access() {
    return this.isDev() || TIER_2_ACCESS_TIERS.includes(this.getSubscriptionLevel());
  }

  // ElevenLabs voices through Sentient Sims AI come with Tier 3 and Tier 4
  canUseElevenLabs() {
    return this.isDev() || ELEVENLABS_TIERS.includes(this.getSubscriptionLevel());
  }

  canUseModel(model: AIModel) {
    if (!model.requiresTier) {
      return true;
    }
    return model.requiresTier === 'tier2' && this.hasTier2Access();
  }
}
