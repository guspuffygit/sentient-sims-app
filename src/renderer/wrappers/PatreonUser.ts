import { AmplifyUser } from '@aws-amplify/ui';

export default class PatreonUser {
  private readonly user?: AmplifyUser;

  constructor(user?: AmplifyUser) {
    this.user = user;
  }

  getPatreonId() {
    if (this.user?.attributes?.preferred_username) {
      const patreonId = this.user.attributes.preferred_username;
      if (patreonId) {
        return patreonId;
      }
    }

    return null;
  }

  getSubscriptionLevel() {
    if (this.user?.attributes?.['custom:subscription_level']) {
      return this.user.attributes['custom:subscription_level'];
    }

    return 'free';
  }

  getFounderStatus() {
    if (this.user?.attributes?.['custom:founderstatus']) {
      return this.user.attributes['custom:founderstatus'];
    }

    return null;
  }

  isPatreonLinked() {
    return !!this.getPatreonId();
  }

  isFounder() {
    return this.getFounderStatus() === 'founder';
  }

  isDevOrSubscriber() {
    const founderStatus = this.getFounderStatus();
    const subscriptionLevel = this.getSubscriptionLevel();
    if (subscriptionLevel === 'tier1') {
      return true;
    }
    if (subscriptionLevel === 'tier2') {
      return true;
    }
    return founderStatus === 'dev';
  }
}
