/* eslint-disable react/jsx-no-useless-fragment */
import { Authenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <Authenticator socialProviders={['google']}>
      {({ user }) => {
        if (user) {
          navigate('/');
        }
        return <></>;
      }}
    </Authenticator>
  );
}
