import { Box, Checkbox, FormControlLabel, FormHelperText, Switch, TextField } from '@mui/material';
import { ChangeEvent } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import HelpButton from 'renderer/components/HelpButton';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { defaultWwPatterIntervalSeconds } from 'main/sentient-sims/constants';
import useSetting from '../hooks/useSetting';

type AnimationMappingSettingsComponentProps = {
  apiType: ApiType;
};

export function AnimationMappingSettingsComponent({ apiType }: AnimationMappingSettingsComponentProps) {
  const animationMappingEnabled = useSetting(SettingsEnum.MAPPING_NOTIFICATION_ENABLED, true);
  // The Wicked Whims patter between an act's animation changes
  const patterEnabled = useSetting(SettingsEnum.WW_PATTER_ENABLED, true);
  const patterInterval = useSetting<number>(SettingsEnum.WW_PATTER_INTERVAL_SECONDS, defaultWwPatterIntervalSeconds);

  const onAnimationMappingEnabledChange = (change: ChangeEvent<HTMLInputElement>) => {
    void animationMappingEnabled.setSetting(change.target.checked);
  };

  if (apiType === ApiType.OpenAI) {
    return <></>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          label="Enable Animation Mapping"
          control={<Checkbox checked={animationMappingEnabled.value} onChange={onAnimationMappingEnabledChange} />}
        />
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/External-Mod-Support#mapping-animations" />
      </Box>
      <FormControlLabel
        label="Wicked Whims: keep talking between animations"
        control={
          <Switch
            checked={patterEnabled.value}
            onChange={(change) => void patterEnabled.setSetting(change.target.checked)}
          />
        }
      />
      <TextField
        sx={{ marginTop: 1, width: 260 }}
        size="small"
        type="number"
        label="Seconds of quiet before the next line"
        disabled={!patterEnabled.value}
        value={patterInterval.value}
        onChange={(change) => void patterInterval.setSetting(Number(change.target.value))}
      />
      <FormHelperText>
        While one Wicked Whims animation plays, one Sim at a time says one more line (or just sounds) after this many
        seconds of quiet, so an act is not silent between animation changes. Shorter at speed 2 and 3, held while you
        pause and at ultra speed. 10 to 60 seconds.
      </FormHelperText>
    </Box>
  );
}
