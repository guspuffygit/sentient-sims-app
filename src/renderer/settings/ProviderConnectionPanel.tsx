import React from 'react';
import { Box, Button, FormHelperText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useMembership } from 'renderer/hooks/useMembership';
import { FOUNDER_ACCESS_TEXT } from 'renderer/billing/membershipView';
import ApiKeyAIComponent from '../ApiKeyAIComponent';
import { AIEndpointComponent } from './AIEndpointComponent';

function SentientSimsConnectionPanel() {
  const { userAttributes } = useAuth();
  const { membership } = useMembership();
  const navigate = useNavigate();

  const errors: React.JSX.Element[] = [];
  if (!userAttributes) {
    errors.push(
      <FormHelperText key="login" sx={{ marginBottom: 2 }} error>
        You must be logged in to use the Sentient Sims AI API
      </FormHelperText>,
    );
  }
  const workerOnly = membership.isWorkerOnly();
  if (userAttributes && (workerOnly || !membership.isMember())) {
    errors.push(
      <Box key="member" sx={{ marginBottom: 2 }}>
        <FormHelperText sx={{ marginBottom: 1 }} error={!workerOnly}>
          {workerOnly ? FOUNDER_ACCESS_TEXT : 'A Sentient Sims membership is needed to use the Sentient Sims AI'}
        </FormHelperText>
        <Button
          variant="contained"
          size="medium"
          onClick={() => {
            void navigate('/settings', { state: { tab: 'membership' } });
          }}
        >
          See plans
        </Button>
      </Box>,
    );
  }

  return (
    <>
      {errors.length > 0 ? <Box sx={{ marginBottom: 2 }}>{errors}</Box> : null}
      <AIEndpointComponent
        type={ApiType.SentientSimsAI}
        selectedApiType={ApiType.SentientSimsAI}
        settingsEnum={SettingsEnum.SENTIENTSIMSAI_ENDPOINT}
      />
    </>
  );
}

// Connection fields (API key, endpoint, account) for a single provider.
// Stored once per provider type and shared by every configuration using it.
// hideEndpoint keeps a hosted provider's endpoint out of the setup wizard.
export function ProviderConnectionPanel({
  apiType,
  hideEndpoint = false,
}: {
  apiType: ApiType;
  hideEndpoint?: boolean;
}): React.JSX.Element | null {
  switch (apiType) {
    case ApiType.OpenAI:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
          {hideEndpoint ? null : (
            <AIEndpointComponent
              type={ApiType.OpenAI}
              selectedApiType={ApiType.OpenAI}
              settingsEnum={SettingsEnum.OPENAI_ENDPOINT}
            />
          )}
        </>
      );
    case ApiType.OpenRouter:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.OPENROUTER_KEY} aiName="OpenRouter" />
          <AIEndpointComponent
            type={ApiType.OpenRouter}
            selectedApiType={ApiType.OpenRouter}
            settingsEnum={SettingsEnum.OPENROUTER_ENDPOINT}
          />
        </>
      );
    case ApiType.VLLM:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.VLLM_APIKEY} optional aiName="VLLM" />
          <AIEndpointComponent
            type={ApiType.VLLM}
            selectedApiType={ApiType.VLLM}
            settingsEnum={SettingsEnum.VLLM_ENDPOINT}
          />
        </>
      );
    case ApiType.NovelAI:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.NOVELAI_KEY} aiName="NovelAI" />
          <AIEndpointComponent
            type={ApiType.NovelAI}
            selectedApiType={ApiType.NovelAI}
            settingsEnum={SettingsEnum.NOVELAI_ENDPOINT}
          />
        </>
      );
    case ApiType.KoboldAI:
      return (
        <AIEndpointComponent
          type={ApiType.KoboldAI}
          selectedApiType={ApiType.KoboldAI}
          settingsEnum={SettingsEnum.KOBOLDAI_ENDPOINT}
        />
      );
    case ApiType.Gemini:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.GEMINI_KEYS} aiName="Gemini" />
          {hideEndpoint ? null : (
            <AIEndpointComponent
              type={ApiType.Gemini}
              selectedApiType={ApiType.Gemini}
              settingsEnum={SettingsEnum.GEMINI_ENDPOINT}
            />
          )}
        </>
      );
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI:
      return <SentientSimsConnectionPanel />;
    default:
      return null;
  }
}
