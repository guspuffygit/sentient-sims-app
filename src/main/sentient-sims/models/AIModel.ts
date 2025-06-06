export type AIModel = {
  name: string;
  displayName: string;
};

export type ModelResponse = {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
  displayName?: string;
  name?: string;
};

export type AIModelResponse = {
  data: ModelResponse[];
};

export function responseToAIModels(response: AIModelResponse): AIModel[] {
  const aiModels: AIModel[] = [];

  response.data.forEach((modelResponse) => {
    let { name, displayName } = modelResponse;
    if (!name) {
      name = modelResponse.id;
    }
    if (!displayName) {
      displayName = name;
    }
    aiModels.push({
      name,
      displayName,
    });
  });

  return aiModels;
}

export function compareAIModels(a: AIModel, b: AIModel): number {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export function compareAIModelDisplayName(a: AIModel, b: AIModel): number {
  if (a.displayName < b.displayName) {
    return -1;
  }
  if (a.displayName > b.displayName) {
    return 1;
  }
  return 0;
}
