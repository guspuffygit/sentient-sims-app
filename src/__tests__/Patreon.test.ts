import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import { CognitoGroup, PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';

function mockPatreonUser({ isMember, isFounder }: { isMember: boolean; isFounder: boolean }): PatreonUser {
  return {
    isMember: vi.fn().mockReturnValue(isMember),
    isFounder: vi.fn().mockReturnValue(isFounder),
  } as unknown as PatreonUser;
}

describe('Patreon', () => {
  it('nightly founder', () => {
    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUser({ isMember: true, isFounder: true }));
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Founder Early Access');
  });

  it('nightly dev or subscriber', () => {
    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUser({ isMember: true, isFounder: false }));
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Patreon Early Access');
  });

  it('nightly no dev or founder or subscriber', () => {
    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUser({ isMember: false, isFounder: false }));
    expect(disableNightly).toEqual(true);
    expect(nightlyText).toEqual('Patreon Early Access');
  });
});

describe('CognitoGroups', () => {
  it('user in mappers group', () => {
    const user = new PatreonUser({ sub: 'abc', emailVerified: true, groups: ['mappers'] });
    expect(user.isMapper()).toEqual(true);
    expect(user.isInGroup(CognitoGroup.Mappers)).toEqual(true);
  });

  it('user in other groups only', () => {
    const user = new PatreonUser({ sub: 'abc', emailVerified: true, groups: ['admins'] });
    expect(user.isMapper()).toEqual(false);
  });

  it('user with no groups', () => {
    const user = new PatreonUser({ sub: 'abc', emailVerified: true });
    expect(user.isMapper()).toEqual(false);
    expect(user.getGroups()).toEqual([]);
  });

  it('logged out user', () => {
    const user = new PatreonUser(undefined);
    expect(user.isMapper()).toEqual(false);
  });
});
