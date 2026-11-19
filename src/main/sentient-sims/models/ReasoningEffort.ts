import { ApiType } from './ApiType';

// The values an OpenAI-compatible server takes for reasoning_effort. LM Studio lists exactly these
// in its error for any other value; none turns thinking off on a model that allows it.
export const reasoningEfforts = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'] as const;

export type ReasoningEffort = (typeof reasoningEfforts)[number];

export function reasoningEffortFromValue(value: unknown): ReasoningEffort | undefined {
  return reasoningEfforts.find((effort) => effort === value);
}

export function reasoningEffortName(effort: ReasoningEffort): string {
  switch (effort) {
    case 'none':
      return 'None (thinking off)';
    case 'minimal':
      return 'Minimal';
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    default:
      return 'Extra high';
  }
}

// Only the OpenAI-compatible provider takes the setting. OpenRouter turns reasoning down on
// its own, Gemini's thinking is turned down in GeminiService, and the rest have no such field.
export function supportsReasoningEffort(apiType: ApiType): boolean {
  return apiType === ApiType.OpenAI;
}

// The body field for a chosen effort, or nothing when none is chosen: a server that does not
// know the field may reject it, so an unset effort must send nothing at all. An OpenRouter
// endpoint keeps its own reasoning handling in OpenAIService.
export function reasoningEffortBody(
  effort: ReasoningEffort | undefined,
  openRouterEndpoint: boolean,
): { reasoning_effort: ReasoningEffort } | undefined {
  if (effort === undefined || openRouterEndpoint) {
    return undefined;
  }
  return { reasoning_effort: effort };
}
