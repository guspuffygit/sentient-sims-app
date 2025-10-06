import { appApiUrl } from 'main/sentient-sims/constants';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';
import { useEffect, useState } from 'react';

export default function useLastExceptionFiles() {
  const [lastExceptionFiles, setLastExceptionFiles] = useState<LastExceptionFile[]>([]);

  async function getLastExceptionFiles() {
    const response = await fetch(`${appApiUrl}/files/last-exception`);
    const jsonResponse = await response.json();
    // convert Date string back to Date object
    jsonResponse.forEach((lastExceptionFile: any) => (lastExceptionFile.created = new Date(lastExceptionFile.created)));
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

  async function refresh() {
    return getLastExceptionFiles();
  }

  return {
    lastExceptionFiles,
    deleteFiles,
    refresh,
  };
}
