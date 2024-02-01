import { appApiUrl } from 'main/sentient-sims/constants';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';
import { useEffect, useState } from 'react';

export default function useLastExceptionFiles() {
  const [lastExceptionFiles, setLastExceptionFiles] = useState<
    LastExceptionFile[]
  >([]);

  async function getLastExceptionFiles() {
    const response = await fetch(`${appApiUrl}/files/last-exception`);
    const jsonResponse = await response.json();
    setLastExceptionFiles(jsonResponse);
  }

  useEffect(() => {
    getLastExceptionFiles();
  }, []);

  async function deleteFiles() {
    await fetch(`${appApiUrl}/files/last-exception`, {
      method: 'DELETE',
    });
    await getLastExceptionFiles();
  }

  return {
    lastExceptionFiles,
    deleteFiles,
  };
}
