import { ResourcesConfig } from 'aws-amplify';
import { appApiUrl } from 'main/sentient-sims/constants';

export const AmplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_qRTW6SLkg',
      userPoolClientId: '2cjmpeg1ie22sfud6ddbsgvjpl',
      identityPoolId: 'us-east-1:2d20518d-feb1-46ff-87ad-ac45fae61eb1',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        oauth: {
          domain: 'sentientsimulations.auth.us-east-1.amazoncognito.com',
          scopes: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [`${appApiUrl}/login/callback`],
          redirectSignOut: [`${appApiUrl}/login/signout`],
          responseType: 'code',
          providers: ['Google'],
        },
      },
      passwordFormat: {
        minLength: 8,
      },
    },
  },
};
