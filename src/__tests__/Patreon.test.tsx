import '@testing-library/jest-dom';
import PatreonUser from 'renderer/wrappers/PatreonUser';
import { getNightlyAccess } from '../renderer/util/nightlyAccess';

jest.mock('renderer/wrappers/PatreonUser');
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

    const { disableNightly, nightlyText } = getNightlyAccess(
      mockPatreonUserInstance as any
    );
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Founder Early Access');
  });

  it('nightly dev or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: jest.fn().mockReturnValue(true),
      isFounder: jest.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(
      mockPatreonUserInstance as any
    );
    expect(disableNightly).toEqual(false);
    expect(nightlyText).toEqual('Patreon Early Access');
  });

  it('nightly no dev or founder or subscriber', () => {
    const mockPatreonUserInstance = {
      isMember: jest.fn().mockReturnValue(false),
      isFounder: jest.fn().mockReturnValue(false),
    };

    const { disableNightly, nightlyText } = getNightlyAccess(
      mockPatreonUserInstance as any
    );
    expect(disableNightly).toEqual(true);
    expect(nightlyText).toEqual('Patreon Early Access');
  });
});
