import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';

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
