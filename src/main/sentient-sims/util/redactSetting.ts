// Player log bundles are uploaded publicly to Discord, so a setting or nested field named
// like a secret (openaiKey, geminiKeys, twitchAuth.refreshToken, ...) never leaves verbatim.
// The capital letter keeps voiceInputHotkey readable.
const secretName = /(?:^|_)(?:key|keys|token|secret|password)$|(?:Key|Keys|Token|Secret|Password)$/;

export const redactedSettingValue = '<redacted>';

export function isSecretSettingName(name: string): boolean {
  return secretName.test(name);
}

export function redactSettingValue(name: string, value: unknown): unknown {
  if (isSecretSettingName(name)) {
    const unset = value === undefined || value === null || value === '';
    return unset ? value : redactedSettingValue;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSettingValue(name, item));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([field, fieldValue]) => [field, redactSettingValue(field, fieldValue)]),
    );
  }
  return value;
}
