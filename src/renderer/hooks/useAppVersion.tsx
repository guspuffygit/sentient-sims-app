/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { useEffect, useState } from 'react';

export default function useAppVersion() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch('http://localhost:25148/versions/app')
      .then((res) => res.json())
      .then((response: any) => {
        setVersion(response.version);
      });
  }, []);

  return version;
}
