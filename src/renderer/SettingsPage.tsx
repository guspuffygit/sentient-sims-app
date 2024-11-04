import { Box, Divider, Typography } from '@mui/material';

import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  openaiDefaultEndpoint,
  openaiDefaultModel,
} from 'main/sentient-sims/constants';
import { LoadingButton } from '@mui/lab';
import AppCard from './AppCard';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import LocalizationSettingsComponent from './settings/LocalizationSettingsComponent';
import OpenAISettingsComponent from './settings/OpenAISettingsComponent';
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

export default function SettingsPage() {
  const aiSettings = useAISettings();

  return (
    <AppCard>
      <Typography>Settings</Typography>
      <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
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
      <OpenAISettingsComponent apiType={aiSettings.aiApiType}>
        <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
        <AIEndpointComponent
          type={ApiType.OpenAI}
          selectedApiType={ApiType.OpenAI}
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
      </OpenAISettingsComponent>
      <KoboldAISettingsComponent apiType={aiSettings.aiApiType} />
      <SentientSimsSettingsComponent apiType={aiSettings.aiApiType} />
      <AnimationMappingSettingsComponent apiType={aiSettings.aiApiType} />
    </AppCard>
  );
}
