import { describe, expect, it } from 'vitest';
import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import { CognitoGroup, Membership } from 'main/sentient-sims/wrappers/Membership';
import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { AuthUserAttributes } from 'renderer/providers/AuthProvider';

function claims(attributes: Partial<AuthUserAttributes> = {}): AuthUserAttributes {
  return { sub: 'abc', emailVerified: true, ...attributes };
}

function info(overrides: Partial<MembershipInfo> = {}): MembershipInfo {
  return {
    member: true,
    source: 'stripe',
    tier: 'tier2',
    status: 'active',
    founder: false,
    dev: false,
    priceUsd: 20,
    includedUsd: 12,
    extraEnabled: false,
    extraLimitUsd: 0,
    lane: 'fast',
    periodEnd: '2026-11-27T00:00:00Z',
    cancelAtPeriodEnd: false,
    usage: { percent: 62, state: 'normal', extraUsd: 0 },
    ...overrides,
  };
}

describe('Membership from the ID token claims while /me loads', () => {
  it.each([
    ['nothing', {}, false, 'none'],
    ['tier1 patron', { subscriptionLevel: 'tier1' }, true, 'cognito'],
    ['tier2 patron', { subscriptionLevel: 'tier2' }, true, 'cognito'],
    ['tier3 patron', { subscriptionLevel: 'tier3' }, true, 'cognito'],
    ['tier4 patron', { subscriptionLevel: 'tier4' }, true, 'cognito'],
    ['unknown level', { subscriptionLevel: 'member' }, false, 'none'],
    ['founder only', { founderStatus: 'founder' }, false, 'founder'],
    ['dev', { founderStatus: 'dev' }, true, 'dev'],
    ['lapsed', { subscriptionLevel: 'free', founderStatus: 'founder' }, false, 'founder'],
  ])('%s', (_name, attributes, member, source) => {
    const membership = new Membership(claims(attributes));
    expect(membership.isMember()).toBe(member);
    expect(membership.getSource()).toBe(source);
  });

  it('treats a signed out user as nobody', () => {
    const membership = new Membership(undefined);
    expect(membership.isMember()).toBe(false);
    expect(membership.isFounder()).toBe(false);
  });
});

describe('Membership from /me', () => {
  it('prefers the server answer over the claims', () => {
    const canceled = new Membership(
      claims({ subscriptionLevel: 'tier2' }),
      info({ member: false, status: 'canceled' }),
    );
    expect(canceled.isMember()).toBe(false);

    const paid = new Membership(claims({ subscriptionLevel: 'free' }), info());
    expect(paid.isMember()).toBe(true);
    expect(paid.isStripeMember()).toBe(true);
    expect(paid.isSubscriber()).toBe(true);
  });

  it('tells the patreon and stripe sources apart', () => {
    expect(new Membership(claims(), info({ source: 'patreon', tier: 'tier1' })).isPatreonMember()).toBe(true);
    expect(new Membership(claims(), info()).isStripeMember()).toBe(true);
    expect(new Membership(claims(), info()).isPatreonMember()).toBe(false);
  });

  it('counts a claims-only patron as a Patreon member until /me answers', () => {
    const patron = new Membership(claims({ subscriptionLevel: 'tier2' }));
    expect(patron.isPatreonMember()).toBe(true);
    expect(patron.isStripeMember()).toBe(false);
    expect(new Membership(claims({ founderStatus: 'dev' })).isPatreonMember()).toBe(false);
  });

  it('shows a founder badge without membership', () => {
    const founder = new Membership(
      claims({ founderStatus: 'founder' }),
      info({ member: false, source: 'none', founder: true }),
    );
    expect(founder.isFounder()).toBe(true);
    expect(founder.isMember()).toBe(false);
  });

  it('lets a founder without a plan use the worker models only', () => {
    const founder = new Membership(
      claims({ founderStatus: 'founder' }),
      info({ member: false, source: 'founder', founder: true, workerOnly: true }),
    );
    expect(founder.isMember()).toBe(false);
    expect(founder.isWorkerOnly()).toBe(true);
    expect(founder.canUseSentientSimsAI()).toBe(true);
  });

  it('treats a founder as worker-only from the claims while /me loads', () => {
    expect(new Membership(claims({ founderStatus: 'founder' })).isWorkerOnly()).toBe(true);
    expect(new Membership(claims({ founderStatus: 'founder', subscriptionLevel: 'tier1' })).isWorkerOnly()).toBe(false);
    expect(new Membership(claims()).canUseSentientSimsAI()).toBe(false);
  });

  it('opens ElevenLabs voices to Tier 3, Tier 4 and devs', () => {
    expect(new Membership(claims({ subscriptionLevel: 'tier2' })).canUseElevenLabs()).toBe(false);
    expect(new Membership(claims({ subscriptionLevel: 'tier3' })).canUseElevenLabs()).toBe(true);
    expect(new Membership(claims({ subscriptionLevel: 'tier4' })).canUseElevenLabs()).toBe(true);
    expect(new Membership(claims({ founderStatus: 'dev' })).canUseElevenLabs()).toBe(true);
    expect(new Membership(claims({ founderStatus: 'founder' })).canUseElevenLabs()).toBe(false);
    expect(new Membership(claims()).canUseElevenLabs()).toBe(false);
  });

  it('takes the ElevenLabs answer from /me once it has loaded', () => {
    expect(
      new Membership(
        claims({ subscriptionLevel: 'tier3' }),
        info({ tier: 'tier3', elevenLabs: true }),
      ).canUseElevenLabs(),
    ).toBe(true);
    expect(
      new Membership(
        claims({ subscriptionLevel: 'tier3' }),
        info({ tier: 'tier2', elevenLabs: false }),
      ).canUseElevenLabs(),
    ).toBe(false);
    expect(new Membership(claims(), info({ tier: 'tier4' })).canUseElevenLabs()).toBe(true);
    expect(new Membership(claims(), info({ tier: 'tier1' })).canUseElevenLabs()).toBe(false);
    expect(
      new Membership(claims(), info({ member: false, tier: 'tier3', status: 'canceled' })).canUseElevenLabs(),
    ).toBe(false);
  });

  it('gives a subscribed founder full access', () => {
    const founder = new Membership(claims({ founderStatus: 'founder' }), info({ founder: true }));
    expect(founder.isWorkerOnly()).toBe(false);
    expect(founder.canUseSentientSimsAI()).toBe(true);
  });

  it('counts a dev as a member but not a subscriber', () => {
    const dev = new Membership(claims(), info({ source: 'dev', dev: true, tier: '' }));
    expect(dev.isMember()).toBe(true);
    expect(dev.isDev()).toBe(true);
    expect(dev.isSubscriber()).toBe(false);
  });
});

describe('nightly access', () => {
  it('opens for members and names founders', () => {
    expect(getNightlyAccess(new Membership(claims({ subscriptionLevel: 'tier1' })))).toEqual({
      disableNightly: false,
      nightlyText: 'Member Early Access',
    });
    expect(getNightlyAccess(new Membership(claims({ founderStatus: 'founder' }), info({ founder: true })))).toEqual({
      disableNightly: false,
      nightlyText: 'Founder Early Access',
    });
    expect(getNightlyAccess(new Membership(claims({ founderStatus: 'founder' })))).toEqual({
      disableNightly: true,
      nightlyText: 'Founder Early Access',
    });
    expect(getNightlyAccess(new Membership(claims()))).toEqual({
      disableNightly: true,
      nightlyText: 'Member Early Access',
    });
  });
});

describe('CognitoGroups', () => {
  it('user in mappers group', () => {
    const user = new Membership(claims({ groups: ['mappers'] }));
    expect(user.isMapper()).toEqual(true);
    expect(user.isInGroup(CognitoGroup.Mappers)).toEqual(true);
  });

  it('user in other groups only', () => {
    expect(new Membership(claims({ groups: ['admins'] })).isMapper()).toEqual(false);
  });

  it('user with no groups', () => {
    const user = new Membership(claims());
    expect(user.isMapper()).toEqual(false);
    expect(user.getGroups()).toEqual([]);
  });

  it('logged out user', () => {
    expect(new Membership(undefined).isMapper()).toEqual(false);
  });
});
