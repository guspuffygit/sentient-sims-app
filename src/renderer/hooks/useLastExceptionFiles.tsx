import { LastExceptionFile } from 'main/sentient-sims/lastException';
import { useEffect, useState } from 'react';

export default function useLastExceptionFiles() {
  const [lastExceptionFiles, setLastExceptionFiles] = useState<
    LastExceptionFile[]
  >([]);

  async function getLastExceptionFiles() {
    const response = await fetch('http://localhost:25148/files/last-exception');
    const jsonResponse = await response.json();
    setLastExceptionFiles(jsonResponse);
  }

  useEffect(() => {
    getLastExceptionFiles();
  }, []);

  async function deleteFiles() {
    await fetch('http://localhost:25148/files/last-exception', {
      method: 'DELETE',
    });
    await getLastExceptionFiles();
  }

  return {
    lastExceptionFiles,
    deleteFiles,
  };
}
