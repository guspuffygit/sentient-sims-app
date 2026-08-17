import { AIModel } from './AIModel';
import { openrouterDefaultEndpoint } from '../constants';

export function isOpenRouterEndpoint(endpoint: string): boolean {
  return endpoint.trim().replace(/\/+$/, '').toLowerCase() === openrouterDefaultEndpoint;
}

// Curated picks for Sims dialogue: uncensored (none refused an explicit scene prompt),
// quick enough for in-game generation (~160-380ms for the default 90 response tokens),
// and served by providers at 99.6%+ uptime. Ordered fastest first. The app truncates
// prompts to ~3900 tokens, so every context window here has room to spare.
//
// Deliberately excluded after testing: nemotron-3-super leaks its reasoning into the
// prose, grok-4.5 ignores max_tokens (408 tokens for a 90 token cap), and cydonia-24b
// returned provider errors.
export const openrouterRecommendedModels: AIModel[] = [
  {
    name: 'sao10k/l3-lunaris-8b',
    displayName: 'Lunaris 8B - fastest, roleplay tuned',
  },
  {
    name: 'mistralai/mistral-nemo',
    displayName: 'Mistral Nemo - cheapest, 131k context',
  },
  {
    name: 'thedrummer/rocinante-12b',
    displayName: 'Rocinante 12B - best adult prose',
  },
  {
    name: 'cognitivecomputations/dolphin-mistral-24b-venice-edition',
    displayName: 'Dolphin Mistral 24B Venice - fully uncensored',
  },
  {
    name: 'nousresearch/hermes-4-70b',
    displayName: 'Hermes 4 70B - smartest, still permissive',
  },
];

// OpenRouter serves 300+ models, which makes for an unusable dropdown. The curated picks
// are pinned to the top while the rest of the catalog stays selectable underneath. A
// recommendation is dropped if OpenRouter has retired it, so the list can never offer a
// model that would fail to generate.
export function buildOpenRouterModels(catalogModelIds: string[]): AIModel[] {
  const catalog = new Set(catalogModelIds);

  const recommended: AIModel[] = openrouterRecommendedModels
    .filter((model) => catalog.has(model.name))
    .map((model, index) => ({ ...model, sortOrder: index }));

  const recommendedNames = new Set(recommended.map((model) => model.name));
  const remaining: AIModel[] = catalogModelIds
    .filter((id) => !recommendedNames.has(id))
    .map((id) => ({ name: id, displayName: id }));

  return [...recommended, ...remaining];
}
