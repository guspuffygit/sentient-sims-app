import { Box, Button, Divider, Tab } from '@mui/material';

import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { AIActionOverrides, AIActionType } from 'main/sentient-sims/models/AIActionType';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { SyntheticEvent, useMemo, useState } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import AppCard from './AppCard';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import { AnimationMappingSettingsComponent } from './settings/AnimationMappingSettingsComponent';
import { ModsDirectoryComponent } from './ModsDirectoryComponent';
import { AIStatusComponent } from './AIStatusComponent';
import { useAISettings } from './providers/AISettingsProvider';
import VoiceSettingsComponent from './settings/VoiceSettingsComponent';
import { useSetupWizard } from './providers/SetupWizardProvider';
import { AiMaxResponseLengthSettingsComponent } from './settings/AiMaxResponseLengthSettingsComponent';
import { generationApiTypes, ProviderConfigsComponent } from './settings/ProviderConfigsComponent';
import { ProviderConnectionSettingsComponent } from './settings/ProviderConnectionSettingsComponent';
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

  const usedApiTypes = useMemo(() => {
    const types = new Set<ApiType>();
    configsSetting.value.forEach((config) => {
      types.add(ApiTypeFromValue(config.apiType));
    });
    if (types.size === 0) {
      types.add(aiSettings.aiApiType);
    }
    // CustomAI shares the Sentient Sims AI connection settings
    if (types.has(ApiType.CustomAI)) {
      types.add(ApiType.SentientSimsAI);
    }
    return generationApiTypes.filter((apiType) => types.has(apiType));
  }, [configsSetting.value, aiSettings.aiApiType]);

  return (
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
          <DebugLogsSettingsComponent />
          <ProviderConfigsComponent />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <Button
              loading={aiSettings.aiStatus.loading}
              onClick={() => {
                void aiSettings.testAI();
              }}
              sx={{ marginRight: 2 }}
              color="primary"
              variant="outlined"
            >
              Test Default
            </Button>
            <AIStatusComponent />
          </Box>
          <ProviderConnectionSettingsComponent apiTypes={usedApiTypes} />
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <AnimationMappingSettingsComponent apiType={wickedWhimsApiType} />
          <AiMaxResponseLengthSettingsComponent />
        </TabPanel>
        <TabPanel value={SettingsTabSelectionValue.Voice}>
          <VoiceSettingsComponent />
        </TabPanel>
      </TabContext>
    </AppCard>
  );
}
