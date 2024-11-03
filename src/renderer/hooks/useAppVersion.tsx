import { useEffect, useState } from 'react';
import log from 'electron-log';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';

const versionClient = new VersionClient();

export default function useAppVersion() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    versionClient
      .getAppVersion()
      .then((result) => setVersion(result.version))
      .catch((err: any) => log.error('Error getting app version', err));
  }, []);

  return version;
}
