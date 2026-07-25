export type AIModel = {
  name: string;
  displayName: string;
  // Pins a model to the top of the selector in a deliberate order (lower first).
  // Unset models sort alphabetically below any that set it.
  sortOrder?: number;
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

function compareSortOrder(a: AIModel, b: AIModel): number {
  if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
    return a.sortOrder - b.sortOrder;
  }
  if (a.sortOrder !== undefined) {
    return -1;
  }
  if (b.sortOrder !== undefined) {
    return 1;
  }
  return 0;
}

export function compareAIModels(a: AIModel, b: AIModel): number {
  const bySortOrder = compareSortOrder(a, b);
  if (bySortOrder !== 0) {
    return bySortOrder;
  }
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export function compareAIModelDisplayName(a: AIModel, b: AIModel): number {
  const bySortOrder = compareSortOrder(a, b);
  if (bySortOrder !== 0) {
    return bySortOrder;
  }
  if (a.displayName < b.displayName) {
    return -1;
  }
  if (a.displayName > b.displayName) {
    return 1;
  }
  return 0;
}
