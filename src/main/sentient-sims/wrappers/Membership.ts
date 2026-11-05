import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { MembershipInfo, MembershipSource } from '../models/UserInfo';

export enum CognitoGroup {
  Mappers = 'mappers',
}

const subscriberLevels = ['tier1', 'tier2', 'tier3', 'tier4'];

export const ELEVENLABS_TIERS = ['tier3', 'tier4'];

// Who the signed-in user is to the Sentient Sims AI server. The membership block
// of GET /me is the truth once it has loaded; until then the Cognito claims on the
// ID token stand in, since the server derives its answer from the same claims when
// it has no billing row.
export class Membership {
  private readonly userAttributes?: AuthUserAttributes;

  private readonly info?: MembershipInfo;

  constructor(userAttributes?: AuthUserAttributes, info?: MembershipInfo) {
    this.userAttributes = userAttributes;
    this.info = info;
  }

  getInfo() {
    return this.info;
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

  // A founder badge; on its own it grants only the worker models (isWorkerOnly)
  isFounder() {
    return this.info?.founder ?? this.getFounderStatus() === 'founder';
  }

  isDev() {
    return this.info?.dev ?? this.getFounderStatus() === 'dev';
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

  getSource(): MembershipSource {
    if (this.info) {
      return this.info.source;
    }
    if (this.isDev()) {
      return 'dev';
    }
    if (subscriberLevels.includes(this.getSubscriptionLevel())) {
      return 'cognito';
    }
    if (this.isFounder()) {
      return 'founder';
    }
    return 'none';
  }

  getTier() {
    return this.info?.tier ?? this.getSubscriptionLevel();
  }

  isStripeMember() {
    return this.isMember() && this.getSource() === 'stripe';
  }

  // A claims-only member ('cognito') is billed through Patreon too; /me just has not answered yet
  isPatreonMember() {
    return this.isMember() && ['patreon', 'cognito'].includes(this.getSource());
  }

  isSubscriber() {
    if (this.info) {
      return this.info.member && !this.info.dev;
    }
    return subscriberLevels.includes(this.getSubscriptionLevel());
  }

  isMember() {
    if (this.info) {
      return this.info.member;
    }
    return this.isSubscriber() || this.isDev();
  }

  // A founder without a plan reaches the models that run on Sentient Sims servers
  // (chat, speech to text, Kokoro voices) and nothing hosted by an outside provider
  isWorkerOnly() {
    if (this.info) {
      return this.info.workerOnly ?? false;
    }
    return this.isFounder() && !this.isMember();
  }

  canUseSentientSimsAI() {
    return this.isMember() || this.isWorkerOnly();
  }

  // ElevenLabs voices through Sentient Sims AI come with Tier 3 and Tier 4
  canUseElevenLabs() {
    if (this.info?.elevenLabs !== undefined) {
      return this.info.elevenLabs;
    }
    return this.isDev() || (this.isMember() && ELEVENLABS_TIERS.includes(this.getTier()));
  }
}
