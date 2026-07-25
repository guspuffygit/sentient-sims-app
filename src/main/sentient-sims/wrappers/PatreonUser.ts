import { AuthUserAttributes } from 'renderer/providers/AuthProvider';

export enum CognitoGroup {
  Mappers = 'mappers',
}

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
    const subscriptionLevel = this.getSubscriptionLevel();
    if (subscriptionLevel === 'tier1') {
      return true;
    }
    return subscriptionLevel === 'tier2';
  }

  isMember() {
    return this.isFounder() || this.isSubscriber() || this.isDev();
  }
}
