import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { AIModel } from '../models/AIModel';

export enum CognitoGroup {
  Mappers = 'mappers',
}

// Patreon subscription levels Cognito stores in custom:subscription_level
const PAID_TIERS = ['tier1', 'tier2', 'tier3'];
const TIER2_PERK_TIERS = ['tier2', 'tier3'];

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
    return PAID_TIERS.includes(this.getSubscriptionLevel());
  }

  isMember() {
    return this.isFounder() || this.isSubscriber() || this.isDev();
  }

  // Tier 2 perks go to tier 2 and 3 subscribers (tier 3 includes every tier 2
  // benefit) and devs; founders and tier 1 see them locked
  hasTier2Access() {
    return this.isDev() || TIER2_PERK_TIERS.includes(this.getSubscriptionLevel());
  }

  canUseModel(model: AIModel) {
    if (!model.requiresTier) {
      return true;
    }
    return model.requiresTier === 'tier2' && this.hasTier2Access();
  }
}
