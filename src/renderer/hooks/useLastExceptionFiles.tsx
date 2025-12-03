import { useQuery } from '@tanstack/react-query';
import { appApiUrl } from 'main/sentient-sims/constants';
import { LastExceptionFile } from 'main/sentient-sims/services/LastExceptionService';

export default function useLastExceptionFiles() {
  const lastExceptionFiles = useQuery<LastExceptionFile[]>({
    queryKey: ['lastExceptionFiles'],
    queryFn: async () => {
      const response = await fetch(`${appApiUrl}/files/last-exception`);
      const jsonResponse = await response.json();
      // convert Date string back to Date object
      jsonResponse.forEach(
        (lastExceptionFile: any) => (lastExceptionFile.created = new Date(lastExceptionFile.created)),
      );
      return jsonResponse;
    },
  });

  async function deleteFiles() {
    await fetch(`${appApiUrl}/files/last-exception`, {
      method: 'DELETE',
    });
    await lastExceptionFiles.refetch();
  }

  return {
    lastExceptionFiles: lastExceptionFiles.data ?? [],
    deleteFiles,
    refresh: async () => lastExceptionFiles.refetch(),
  };
}
