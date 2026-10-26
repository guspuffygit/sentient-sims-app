import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormHelperText,
  Tab,
  Typography,
} from '@mui/material';

import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { AIActionOverrides, AIActionType } from 'main/sentient-sims/models/AIActionType';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { SyntheticEvent, useMemo, useState } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AppCard from './AppCard';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import DirectedScenesSettingsComponent from './settings/DirectedScenesSettingsComponent';
import PetsSpeakSettingsComponent from './settings/PetsSpeakSettingsComponent';
import { AnimationMappingSettingsComponent } from './settings/AnimationMappingSettingsComponent';
import { ModsDirectoryComponent } from './ModsDirectoryComponent';
import { GameAppPathComponent } from './GameAppPathComponent';
import { useAISettings } from './providers/AISettingsProvider';
import VoiceSettingsComponent from './settings/VoiceSettingsComponent';
import { useSetupWizard } from './providers/SetupWizardProvider';
import { AiMaxResponseLengthSettingsComponent } from './settings/AiMaxResponseLengthSettingsComponent';
import { ProviderConfigsComponent } from './settings/ProviderConfigsComponent';
import { ProviderConnectionSettingsComponent } from './settings/ProviderConnectionSettingsComponent';
import LocalizationSettingsComponent from './settings/LocalizationSettingsComponent';
import useSetting from './hooks/useSetting';
import { PlaybackFollowsClockSetting } from './settings/voice/VoiceInputSettingsComponent';
import { rendererTiers } from './tiers/merge';

enum SettingsTabSelectionValue {
  Settings = 'settings',
  Voice = 'voice',
}

// The core tabs, then the build tiers' (stream: Twitch)
const SETTINGS_TABS: { value: string; label: string }[] = [
  { value: SettingsTabSelectionValue.Settings, label: 'Settings' },
  { value: SettingsTabSelectionValue.Voice, label: 'Voice' },
  ...rendererTiers.settingsTabs.map(({ value, label }) => ({ value, label })),
];

function tierRows() {
  return rendererTiers.settingsRows.map(({ id, Component }) => <Component key={id} />);
}

export default function SettingsPage() {
  const aiSettings = useAISettings();
  const setupWizard = useSetupWizard();
  const [tabSelectedValue, setTabSelectedValue] = useState('settings');
  const configsSetting = useSetting<AIProviderConfig[]>(SettingsEnum.AI_PROVIDER_CONFIGS, []);
  const defaultIdSetting = useSetting<string>(SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID, '');
  const overridesSetting = useSetting<AIActionOverrides>(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {});

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabSelectedValue(newValue);
  };

  // The provider that actually handles Wicked Whims generations decides
  // whether animation mapping settings are relevant
  const wickedWhimsApiType = useMemo(() => {
    const configs = configsSetting.value;
    const overrideId = overridesSetting.value[AIActionType.WICKED_WHIMS];
    const config = configs.find((c) => c.id === overrideId) ?? configs.find((c) => c.id === defaultIdSetting.value);
    return config ? ApiTypeFromValue(config.apiType) : aiSettings.aiApiType;
  }, [configsSetting.value, overridesSetting.value, defaultIdSetting.value, aiSettings.aiApiType]);

  return (
    <div>
      <AppCard>
        <TabContext value={tabSelectedValue}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              {SETTINGS_TABS.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </TabList>

            <Button
              endIcon={<ConstructionIcon />}
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => {
                setupWizard.setOpen(true);
              }}
            >
              Setup Wizard
            </Button>
          </Box>
          <TabPanel value={SettingsTabSelectionValue.Settings}>
            <ModsDirectoryComponent />
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
            <ProviderConfigsComponent capability="text" />
            <Accordion disableGutters sx={{ marginTop: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="h6">Advanced</Typography>
                  <FormHelperText sx={{ margin: 0 }}>
                    Fine tuning. Everything works without touching these.
                  </FormHelperText>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <GameAppPathComponent />
                <DirectedScenesSettingsComponent />
                <PetsSpeakSettingsComponent />
                <PlaybackFollowsClockSetting />
                {tierRows()}
                <DebugLogsSettingsComponent />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <ProviderConnectionSettingsComponent />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <ProviderConfigsComponent capability="image" />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <ProviderConfigsComponent capability="embedding" />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <Typography variant="h6">Localization</Typography>
                <FormHelperText sx={{ marginBottom: 1 }}>
                  Translates AI output. Applies when the provider handling an action is OpenAI or Gemini.
                </FormHelperText>
                <LocalizationSettingsComponent />
                <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                <AnimationMappingSettingsComponent apiType={wickedWhimsApiType} />
                <AiMaxResponseLengthSettingsComponent />
              </AccordionDetails>
            </Accordion>
          </TabPanel>
          <TabPanel value={SettingsTabSelectionValue.Voice}>
            <VoiceSettingsComponent />
          </TabPanel>
          {rendererTiers.settingsTabs.map(({ value, Component }) => (
            <TabPanel key={value} value={value}>
              <Component />
            </TabPanel>
          ))}
        </TabContext>
      </AppCard>
    </div>
  );
}
