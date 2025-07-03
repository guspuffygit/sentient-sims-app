import { useQuery } from '@tanstack/react-query';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { compareAIModelDisplayName } from 'main/sentient-sims/models/AIModel';
import { ApiType } from 'main/sentient-sims/models/ApiType';

const aiClient = new AIClient();

export function useAIModels(apiType: ApiType) {
  const aiModels = useQuery({
    queryKey: [`aiModels${apiType}`],
    queryFn: async () => {
      const models = await aiClient.getModels();
      models.sort(compareAIModelDisplayName);
      return models;
    },
  });

  return aiModels;
}
