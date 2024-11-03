/* eslint-disable react/jsx-no-useless-fragment */
import { FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import PatreonUser from '../wrappers/PatreonUser';
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

  return (
    <>
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
      <AIEndpointComponent
        type={ApiType.SentientSimsAI}
        selectedApiType={apiType}
        settingsEnum={SettingsEnum.SENTIENTSIMSAI_ENDPOINT}
        label="Sentient Sims AI URL"
      />
    </>
  );
}
