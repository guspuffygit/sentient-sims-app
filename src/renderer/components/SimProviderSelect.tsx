import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';

type SimProviderSelectProps = {
  configId: string;
  configs: AIProviderConfig[];
  defaultConfig?: AIProviderConfig;
  onChange: (configId: string) => void;
};

/**
 * Pins a Sim's spoken lines (their actor call in every scene) to one provider
 * configuration. Empty leaves them on the usual pick.
 */
export function SimProviderSelect({ configId, configs, defaultConfig, onChange }: SimProviderSelectProps) {
  // A pin to a deleted config reads as Default, as the backend routes it
  const value = configs.some((config) => config.id === configId) ? configId : '';

  return (
    <FormControl fullWidth size="small" sx={{ marginBottom: 2 }}>
      <InputLabel id="sim-provider-label" shrink>
        AI Model
      </InputLabel>
      <Select
        labelId="sim-provider-label"
        id="sim-provider"
        label="AI Model"
        notched
        displayEmpty
        value={value}
        onChange={(change) => {
          onChange(change.target.value);
        }}
      >
        <MenuItem value="">Default{defaultConfig ? ` (${defaultConfig.name})` : ''}</MenuItem>
        {configs.map((config) => (
          <MenuItem key={config.id} value={config.id}>
            {config.name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        The configuration this Sim&apos;s spoken lines come from, ahead of every per-action override. Everything else
        about them keeps the usual pick. Add configurations in Settings &gt; AI.
      </FormHelperText>
    </FormControl>
  );
}
