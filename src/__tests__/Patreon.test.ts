import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';

describe('Patreon', () => {
  it('nightly founder', () => {
    const mockPatreonUserInstance = {
      isMember: vi.fn().mockReturnValue(true),
      isFounder: vi.fn().mockReturnValue(true),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Founder Early Access');
  });

  it('nightly dev or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: vi.fn().mockReturnValue(true),
      isFounder: vi.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Patreon Early Access');
  });

  it('nightly no dev or founder or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: vi.fn().mockReturnValue(false),
      isFounder: vi.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(true);
    expect(nightlyText).toEqual('Patreon Early Access');
  });
});
