import '@testing-library/jest-dom';
import {
  SettingsEnum,
  SettingsService,
} from 'main/sentient-sims/services/SettingsService';

describe('Settings', () => {
  it('should return default value', () => {
    const settings = new SettingsService();
    const model = settings.get(SettingsEnum.OPENAI_MODEL);
    expect(model).toEqual('gpt-3.5-turbo');
  });
});
