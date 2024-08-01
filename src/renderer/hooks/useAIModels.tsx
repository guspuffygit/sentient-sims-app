import { useQuery } from '@tanstack/react-query';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { ApiType } from 'main/sentient-sims/models/ApiType';

const aiClient = new AIClient();

export function useAIModels(apiType: ApiType) {
  const aiModels = useQuery({
    queryKey: [`aiModels${apiType}`],
    queryFn: async () => aiClient.getModels(),
  });

  return aiModels;
}
