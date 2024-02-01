import log from 'electron-log';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';
import { useEffect, useState } from 'react';

const versionClient = new VersionClient();

export default function useModVersion() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    versionClient
      .getModVersion()
      .then((result) => setVersion(result.version))
      .catch((err: any) => log.error('Error getting mod version', err));
  }, []);

  return version;
}
