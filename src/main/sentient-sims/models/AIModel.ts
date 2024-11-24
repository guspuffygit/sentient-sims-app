export type AIModel = {
  name: string;
  displayName: string;
};

export type AIModelResponse = {
  data: AIModel[];
};

export function compareAIModels(a: AIModel, b: AIModel): number {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
