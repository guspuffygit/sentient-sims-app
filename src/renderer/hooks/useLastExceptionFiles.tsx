import { useQuery } from '@tanstack/react-query';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';

const client = new SentientSimsAppClient();

export default function useLastExceptionFiles() {
  const lastExceptionFiles = useQuery<LastExceptionFile[]>({
    queryKey: ['lastExceptionFiles'],
    queryFn: async () => {
      return client.files.getLastExceptionFiles();
    },
  });

  async function deleteFiles() {
    await client.files.deleteLastExceptionFiles();
    await lastExceptionFiles.refetch();
  }

  return {
    lastExceptionFiles: lastExceptionFiles.data ?? [],
    deleteFiles,
    refresh: async () => lastExceptionFiles.refetch(),
  };
}
