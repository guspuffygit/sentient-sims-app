import '@testing-library/jest-dom';
import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';

jest.mock('main/sentient-sims/wrappers/PatreonUser');
describe('Patreon', () => {
  beforeEach(() => {
    // Clear all instances and calls to the mock constructor and methods:
    (PatreonUser as jest.Mock).mockClear();
  });

  it('nightly founder', () => {
    const mockPatreonUserInstance = {
      isMember: jest.fn().mockReturnValue(true),
      isFounder: jest.fn().mockReturnValue(true),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Founder Early Access');
  });

  it('nightly dev or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: jest.fn().mockReturnValue(true),
      isFounder: jest.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Patreon Early Access');
  });

  it('nightly no dev or founder or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: jest.fn().mockReturnValue(false),
      isFounder: jest.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(mockPatreonUserInstance as any);
    expect(disableNightly).toEqual(true);
    expect(nightlyText).toEqual('Patreon Early Access');
  });
});
