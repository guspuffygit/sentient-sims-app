import React from 'react';
import { Box, FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import ApiKeyAIComponent from '../ApiKeyAIComponent';
import { AIEndpointComponent } from './AIEndpointComponent';

function SentientSimsConnectionPanel() {
  const { userAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);

  const errors: React.JSX.Element[] = [];
  if (!userAttributes) {
    errors.push(
      <FormHelperText key="login" sx={{ marginBottom: 2 }} error>
        You must be logged in to use the Sentient Sims AI API
      </FormHelperText>,
    );
  }
  if (!patreonUser.isMember()) {
    errors.push(
      <FormHelperText key="member" sx={{ marginBottom: 2 }} error>
        You must be a Founder or Patron to use the Sentient Sims Uncensored AI
      </FormHelperText>,
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
export function ProviderConnectionPanel({ apiType }: { apiType: ApiType }): React.JSX.Element | null {
  switch (apiType) {
    case ApiType.OpenAI:
      return (
        <>
          <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
          <AIEndpointComponent
            type={ApiType.OpenAI}
            selectedApiType={ApiType.OpenAI}
            settingsEnum={SettingsEnum.OPENAI_ENDPOINT}
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
          <AIEndpointComponent
            type={ApiType.Gemini}
            selectedApiType={ApiType.Gemini}
            settingsEnum={SettingsEnum.GEMINI_ENDPOINT}
          />
        </>
      );
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI:
      return <SentientSimsConnectionPanel />;
    default:
      return null;
  }
}
