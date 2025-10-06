import { Box, Button, Divider, Tab } from '@mui/material';

import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  defaultGeminiModel,
  geminiDefaultEndpoint,
  novelaiDefaultEndpoint,
  novelaiDefaultModel,
  openaiDefaultEndpoint,
  openaiDefaultModel,
} from 'main/sentient-sims/constants';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import { SyntheticEvent, useState } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import AppCard from './AppCard';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import LocalizationSettingsComponent from './settings/LocalizationSettingsComponent';
import OpenAICompatibleSettingsComponent from './settings/OpenAISettingsComponent';
import { AISelectionComponent } from './settings/AISelectionComponent';
import { AnimationMappingSettingsComponent } from './settings/AnimationMappingSettingsComponent';
import { KoboldAISettingsComponent } from './settings/KoboldAISettingsComponent';
import { SentientSimsSettingsComponent } from './settings/SentientSimsSettingsComponent';
import ApiKeyAIComponent from './ApiKeyAIComponent';
import { AIEndpointComponent } from './settings/AIEndpointComponent';
import AIModelSelection from './AIModelSelection';
import { ModsDirectoryComponent } from './ModsDirectoryComponent';
import { AIStatusComponent } from './AIStatusComponent';
import { useAISettings } from './providers/AISettingsProvider';
import NovelAISettingsComponent from './settings/NovelAISettingsComponent';
import GeminiSettingsComponent from './settings/GeminiSettingsComponent';
import VoiceSettingsComponent from './settings/VoiceSettingsComponent';
import { useSetupWizard } from './providers/SetupWizardProvider';

enum SettingsTabSelectionValue {
  Settings = 'settings',
  Voice = 'voice',
}

export default function SettingsPage() {
  const aiSettings = useAISettings();
  const setupWizard = useSetupWizard();
  const [tabSelectedValue, setTabSelectedValue] = useState('settings');

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabSelectedValue(newValue);
  };

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
            onClick={() => setupWizard.setOpen(true)}
          >
            Setup Wizard
          </Button>
        </Box>
        <TabPanel value={SettingsTabSelectionValue.Settings}>
          <ModsDirectoryComponent />
          <DebugLogsSettingsComponent />
          <AISelectionComponent />
          <Box display="flex" alignItems="center" sx={{ marginBottom: 3 }}>
            <LoadingButton
              loading={aiSettings.aiStatus.loading}
              onClick={() => aiSettings.testAI()}
              sx={{ marginRight: 2 }}
              color="primary"
              variant="outlined"
            >
              Test
            </LoadingButton>
            <AIStatusComponent />
          </Box>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <OpenAICompatibleSettingsComponent apiType={ApiType.OpenAI} selectedApiType={aiSettings.aiApiType}>
            <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
            <AIEndpointComponent
              type={ApiType.OpenAI}
              selectedApiType={aiSettings.aiApiType}
              settingsEnum={SettingsEnum.OPENAI_ENDPOINT}
            />
            <AIModelSelection
              apiType={aiSettings.aiApiType}
              defaultModel={openaiDefaultModel}
              defaultEndpoint={openaiDefaultEndpoint}
              modelSetting={SettingsEnum.OPENAI_MODEL}
              endpointSetting={SettingsEnum.OPENAI_ENDPOINT}
            />
            <LocalizationSettingsComponent />
          </OpenAICompatibleSettingsComponent>
          <OpenAICompatibleSettingsComponent apiType={ApiType.VLLM} selectedApiType={aiSettings.aiApiType}>
            <ApiKeyAIComponent setting={SettingsEnum.VLLM_APIKEY} optional aiName="VLLM" />
            <AIEndpointComponent
              type={ApiType.VLLM}
              selectedApiType={aiSettings.aiApiType}
              settingsEnum={SettingsEnum.VLLM_ENDPOINT}
            />
            <AIModelSelection
              apiType={aiSettings.aiApiType}
              defaultModel={openaiDefaultModel}
              defaultEndpoint={openaiDefaultEndpoint}
              modelSetting={SettingsEnum.VLLM_MODEL}
              endpointSetting={SettingsEnum.VLLM_ENDPOINT}
            />
          </OpenAICompatibleSettingsComponent>
          <NovelAISettingsComponent apiType={aiSettings.aiApiType}>
            <ApiKeyAIComponent setting={SettingsEnum.NOVELAI_KEY} aiName="NovelAI" />
            <AIEndpointComponent
              type={ApiType.NovelAI}
              selectedApiType={ApiType.NovelAI}
              settingsEnum={SettingsEnum.NOVELAI_ENDPOINT}
            />
            <AIModelSelection
              apiType={aiSettings.aiApiType}
              defaultModel={novelaiDefaultModel}
              defaultEndpoint={novelaiDefaultEndpoint}
              modelSetting={SettingsEnum.NOVELAI_MODEL}
              endpointSetting={SettingsEnum.NOVELAI_ENDPOINT}
            />
          </NovelAISettingsComponent>
          <KoboldAISettingsComponent apiType={aiSettings.aiApiType} />
          <SentientSimsSettingsComponent apiType={aiSettings.aiApiType} />
          <GeminiSettingsComponent apiType={aiSettings.aiApiType}>
            <ApiKeyAIComponent setting={SettingsEnum.GEMINI_KEYS} aiName="Gemini" />
            <AIEndpointComponent
              type={ApiType.Gemini}
              selectedApiType={ApiType.Gemini}
              settingsEnum={SettingsEnum.GEMINI_ENDPOINT}
            />
            <AIModelSelection
              apiType={aiSettings.aiApiType}
              defaultModel={defaultGeminiModel}
              defaultEndpoint={geminiDefaultEndpoint}
              modelSetting={SettingsEnum.GEMINI_MODEL}
              endpointSetting={SettingsEnum.GEMINI_ENDPOINT}
            />
          </GeminiSettingsComponent>
          <AnimationMappingSettingsComponent apiType={aiSettings.aiApiType} />
        </TabPanel>
        <TabPanel value={SettingsTabSelectionValue.Voice}>
          <VoiceSettingsComponent />
        </TabPanel>
      </TabContext>
    </AppCard>
  );
}
