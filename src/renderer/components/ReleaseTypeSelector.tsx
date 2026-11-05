import { MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';
import { useMembership } from 'renderer/hooks/useMembership';

export function ReleaseTypeSelector() {
  const { membership } = useMembership();
  const releaseType: SettingsHook<string> = useSetting<string>(SettingsEnum.MOD_RELEASE, 'main');

  const handleChangeReleaseType = async (event: SelectChangeEvent): Promise<void> => {
    const newType = event.target.value;
    log.debug(`Changed release type to: ${newType}`);
    await releaseType.setSetting(newType);
  };

  const { disableNightly, nightlyText } = getNightlyAccess(membership);

  return (
    <Tooltip title="Select the mod release channel. Members get early access to nightly builds" placement="top">
      <Select
        size="small"
        labelId="release-type-select-label"
        id="release-type-select"
        value={releaseType.value}
        sx={{ minWidth: 100 }}
        onChange={(event) => {
          void handleChangeReleaseType(event);
        }}
      >
        <MenuItem value="main">Stable</MenuItem>
        <MenuItem disabled={disableNightly} value="develop">
          {nightlyText}
        </MenuItem>
      </Select>
    </Tooltip>
  );
}
