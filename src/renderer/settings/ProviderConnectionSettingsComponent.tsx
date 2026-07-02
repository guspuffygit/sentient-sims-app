import React from 'react';
import { Box, Divider, FormHelperText, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import ApiKeyAIComponent from '../ApiKeyAIComponent';
import { AIEndpointComponent } from './AIEndpointComponent';
import LocalizationSettingsComponent from './LocalizationSettingsComponent';

function SentientSimsConnectionSettings() {
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

function connectionSettingsFor(apiType: ApiType): React.JSX.Element | null {
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
          <LocalizationSettingsComponent />
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
          <LocalizationSettingsComponent />
        </>
      );
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI:
      return <SentientSimsConnectionSettings />;
    default:
      return null;
  }
}

type ProviderConnectionSettingsComponentProps = {
  apiTypes: ApiType[];
};

// Connection settings (API keys, endpoints) are shared per provider type across
// all provider configurations using that provider.
export function ProviderConnectionSettingsComponent({ apiTypes }: ProviderConnectionSettingsComponentProps) {
  return (
    <>
      {apiTypes.map((apiType) => {
        const settings = connectionSettingsFor(apiType);
        if (!settings) {
          return null;
        }
        return (
          <Box key={apiType} sx={{ marginBottom: 2 }}>
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              {ApiTypeName(apiType)} Settings
            </Typography>
            {settings}
          </Box>
        );
      })}
    </>
  );
}
