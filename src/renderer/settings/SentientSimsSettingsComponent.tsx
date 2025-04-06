/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { Box, FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  sentientSimsAIDefaultModel,
  sentientSimsAIHost,
} from 'main/sentient-sims/constants';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import AIModelSelection from '../AIModelSelection';
import { AIEndpointComponent } from './AIEndpointComponent';

type SentientSimsSettingsComponentProps = {
  apiType: ApiType;
};

export function SentientSimsSettingsComponent({
  apiType,
}: SentientSimsSettingsComponentProps) {
  const { user } = useAuthenticator((context) => [context.user]);

  if (apiType !== ApiType.SentientSimsAI) {
    return <></>;
  }

  const patreonUser = new PatreonUser(user);

  const showLogInError = !user;
  const showMemberError = !patreonUser.isMember();

  const errors: React.JSX.Element[] = [];
  if (showLogInError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        You must be logged in to use the Sentient Sims AI API
      </FormHelperText>,
    );
  }
  if (showMemberError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        You must be a Founder or Patron to use the Sentient Sims Uncensored AI
      </FormHelperText>,
    );
  }

  return (
    <>
      {showLogInError || showMemberError ? (
        <Box sx={{ marginBottom: 2 }}>{errors}</Box>
      ) : null}
      <AIEndpointComponent
        type={ApiType.SentientSimsAI}
        selectedApiType={apiType}
        settingsEnum={SettingsEnum.SENTIENTSIMSAI_ENDPOINT}
      />
      <AIModelSelection
        apiType={apiType}
        defaultModel={sentientSimsAIDefaultModel}
        defaultEndpoint={sentientSimsAIHost}
        modelSetting={SettingsEnum.SENTIENTSIMSAI_MODEL}
        endpointSetting={SettingsEnum.SENTIENTSIMSAI_ENDPOINT}
      />
    </>
  );
}
