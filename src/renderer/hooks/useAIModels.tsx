import { useQuery } from '@tanstack/react-query';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { compareAIModelDisplayName } from 'main/sentient-sims/models/AIModel';
import { ApiType } from 'main/sentient-sims/models/ApiType';

const aiClient = new AIClient();

export function useAIModels(apiType: ApiType, enabled: boolean = true) {
  const aiModels = useQuery({
    queryKey: [`aiModels${apiType}`],
    queryFn: async () => {
      const models = await aiClient.getModels(apiType);
      models.sort(compareAIModelDisplayName);
      return models;
    },
    enabled,
  });

  return aiModels;
}
