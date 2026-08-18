import { Box, Button, Divider, FormHelperText, Tab, Typography } from '@mui/material';

import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { AIActionOverrides, AIActionType } from 'main/sentient-sims/models/AIActionType';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { SyntheticEvent, useMemo, useState } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import AppCard from './AppCard';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import DirectedScenesSettingsComponent from './settings/DirectedScenesSettingsComponent';
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

enum SettingsTabSelectionValue {
  Settings = 'settings',
  Voice = 'voice',
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
              {Object.entries(SettingsTabSelectionValue).map((selectionvalue) => (
                <Tab key={selectionvalue[0]} label={selectionvalue[0]} value={selectionvalue[1]} />
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
            <GameAppPathComponent />
            <DirectedScenesSettingsComponent />
            <DebugLogsSettingsComponent />
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
            <Typography variant="h5">AI Providers</Typography>
            <FormHelperText sx={{ marginBottom: 2 }}>
              Connections are the shared layer: set up each provider&apos;s API key or endpoint once, then any text,
              image, or embedding configuration can use it.
            </FormHelperText>
            <ProviderConnectionSettingsComponent />
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
            <ProviderConfigsComponent capability="text" />
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
          </TabPanel>
          <TabPanel value={SettingsTabSelectionValue.Voice}>
            <VoiceSettingsComponent />
          </TabPanel>
        </TabContext>
      </AppCard>
    </div>
  );
}
