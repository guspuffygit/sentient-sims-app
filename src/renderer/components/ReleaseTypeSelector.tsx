import { MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';
import { useAuth } from 'renderer/providers/AuthProvider';

export function ReleaseTypeSelector() {
  const { userAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);
  const releaseType: SettingsHook<string> = useSetting<string>(SettingsEnum.MOD_RELEASE, 'main');

  const handleChangeReleaseType = async (event: SelectChangeEvent): Promise<void> => {
    const newType = event.target.value;
    log.debug(`Changed release type to: ${newType}`);
    await releaseType.setSetting(newType);
  };

  const { disableNightly, nightlyText } = getNightlyAccess(patreonUser);

  return (
    <Tooltip title="Select the mod release channel. Patreon members get early access to nightly builds" placement="top">
      <Select
        size="small"
        labelId="release-type-select-label"
        id="release-type-select"
        value={releaseType.value}
        sx={{ minWidth: 100 }}
        onChange={handleChangeReleaseType}
      >
        <MenuItem value="main">Stable</MenuItem>
        <MenuItem disabled={disableNightly} value="develop">
          {nightlyText}
        </MenuItem>
      </Select>
    </Tooltip>
  );
}
