import { appApiUrl } from 'main/sentient-sims/constants';

export const AmplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_cloud_logic_custom: [],
  aws_appsync_graphqlEndpoint: '',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-7u55wkjg75dkbo254gjrxrcrbe',
  aws_cognito_identity_pool_id: 'us-east-1:2d20518d-feb1-46ff-87ad-ac45fae61eb1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_qRTW6SLkg',
  aws_user_pools_web_client_id: '2cjmpeg1ie22sfud6ddbsgvjpl',
  oauth: {
    domain: 'sentientsimulations.auth.us-east-1.amazoncognito.com',
    scope: ['phone', 'email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
    redirectSignIn: `${appApiUrl}/login/callback`,
    redirectSignOut: `${appApiUrl}/login/signout`,
    responseType: 'code',
  },
  federationTarget: 'COGNITO_USER_POOLS',
  aws_cognito_username_attributes: [],
  aws_cognito_social_providers: ['GOOGLE'],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
};
