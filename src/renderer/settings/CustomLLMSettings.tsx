import {
  Box,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { ChangeEvent } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { sentientSimsAIHost } from 'main/sentient-sims/constants';
import HelpButton from 'renderer/components/HelpButton';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import log from 'electron-log';
import useSetting from '../hooks/useSetting';
import PatreonUser from '../wrappers/PatreonUser';

function getAIHelperText(apiType: ApiType) {
  if (apiType === ApiType.OpenAI) {
    return 'OpenAI AI using the same API as ChatGPT and your personal API key.';
  }
  if (apiType === ApiType.SentientSimsAI) {
    return 'Sentient Sims uncensored AI hosted on the Sentient Sims servers.';
  }

  return 'Custom Local or remote AI running on your own PC';
}

export default function CustomLLMSettingsComponent() {
  const { user } = useAuthenticator((context) => [context.user]);
  const patreonUser = new PatreonUser(user);
  const aiType = useSetting(
    SettingsEnum.AI_API_TYPE,
    ApiType.OpenAI.toString()
  );
  const customLLMHostname = useSetting(SettingsEnum.CUSTOM_LLM_HOSTNAME);
  const animationMappingEnabled = useSetting(
    SettingsEnum.MAPPING_NOTIFICATION_ENABLED,
    true
  );

  const handleChangeAIType = async (
    event: SelectChangeEvent
  ): Promise<void> => {
    const newType = event.target.value;

    if (newType === ApiType.OpenAI) {
      log.info('OpenAI');
      await aiType.setSetting(ApiType.OpenAI.toString());
    } else if (newType === ApiType.SentientSimsAI) {
      log.info('Sentient Sims AI');
      await customLLMHostname.resetSetting();
      await aiType.setSetting(ApiType.SentientSimsAI.toString());
    } else if (newType === ApiType.NovelAI) {
      log.info('NovelAI');
      await aiType.setSetting(ApiType.NovelAI.toString());
    } else {
      log.info('Else');
      await aiType.setSetting(ApiType.SentientSimsAI.toString());
      if (customLLMHostname.value === sentientSimsAIHost) {
        await customLLMHostname.setSetting('');
      }
    }
  };

  const onAnimationMappingEnabledChange = (
    change: ChangeEvent<HTMLInputElement>
  ) => {
    animationMappingEnabled.setSetting(change.target.checked);
  };

  let dropdownValue: ApiType = ApiType.CustomAI;
  if (aiType.value === ApiType.OpenAI) {
    dropdownValue = ApiType.OpenAI;
  } else if (aiType.value === ApiType.NovelAI) {
    dropdownValue = ApiType.NovelAI;
  } else if (aiType.value === ApiType.SentientSimsAI) {
    dropdownValue = ApiType.SentientSimsAI;
  }

  const sentientSimsAISelected =
    aiType.value &&
    aiType.value === ApiType.SentientSimsAI.toString() &&
    customLLMHostname.value === sentientSimsAIHost;

  const showLogInError = !user && sentientSimsAISelected;

  const showMemberError = !patreonUser.isMember() && sentientSimsAISelected;

  return (
    <div>
      {showLogInError ? (
        <FormHelperText sx={{ mb: 1 }} error>
          You must be logged in to use the Sentient Sims AI API
        </FormHelperText>
      ) : null}
      {showMemberError ? (
        <FormHelperText sx={{ mb: 1 }} error>
          You must be a Founder or Patron to use the Sentient Sims Uncensored AI
        </FormHelperText>
      ) : null}
      {patreonUser ? null : (
        <FormHelperText sx={{ mb: 1 }} error>
          You must be logged in to use the Sentient Sims AI API
        </FormHelperText>
      )}
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <Select
          size="small"
          labelId="release-type-select-label"
          id="release-type-select"
          value={dropdownValue}
          sx={{ minWidth: 100, marginRight: 2 }}
          onChange={handleChangeAIType}
        >
          <MenuItem value={ApiType.OpenAI}>OpenAI</MenuItem>
          <MenuItem value={ApiType.SentientSimsAI}>
            Sentient Sims Uncensored AI (Founder/Patreon)
          </MenuItem>
          <MenuItem value={ApiType.NovelAI}>NovelAI</MenuItem>
          <MenuItem value={ApiType.CustomAI}>Custom Remote/Local AI</MenuItem>
        </Select>
        <FormHelperText>{getAIHelperText(dropdownValue)}</FormHelperText>
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
      </Box>
      {aiType.value === ApiType.SentientSimsAI.toString() &&
      customLLMHostname.value !== sentientSimsAIHost ? (
        <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
          <TextField
            focused
            id="outlined-basic"
            label="Custom LLM Hostname"
            variant="outlined"
            value={customLLMHostname.value}
            size="small"
            fullWidth
            onChange={(change) =>
              customLLMHostname.setSetting(change.target.value)
            }
            sx={{ marginRight: 2 }}
          />
        </Box>
      ) : null}
      {aiType.value !== ApiType.OpenAI.toString() ? (
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
      ) : null}
    </div>
  );
}
