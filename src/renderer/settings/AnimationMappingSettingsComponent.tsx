/* eslint-disable react/jsx-no-useless-fragment */
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { ChangeEvent } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import HelpButton from 'renderer/components/HelpButton';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import useSetting from '../hooks/useSetting';

type AnimationMappingSettingsComponentProps = {
  apiType: ApiType;
};

export function AnimationMappingSettingsComponent({
  apiType,
}: AnimationMappingSettingsComponentProps) {
  const animationMappingEnabled = useSetting(
    SettingsEnum.MAPPING_NOTIFICATION_ENABLED,
    true
  );

  const onAnimationMappingEnabledChange = (
    change: ChangeEvent<HTMLInputElement>
  ) => {
    animationMappingEnabled.setSetting(change.target.checked);
  };

  if (apiType === ApiType.OpenAI) {
    return <></>;
  }

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <FormControlLabel
        label="Enable Animation Mapping"
        control={
          <Checkbox
            checked={animationMappingEnabled.value}
            onChange={onAnimationMappingEnabledChange}
          />
        }
      />
      <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/External-Mod-Support#mapping-animations" />
    </Box>
  );
}
