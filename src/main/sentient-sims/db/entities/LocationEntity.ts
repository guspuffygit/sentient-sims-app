// Where the description a location resolves to came from, highest precedence first:
//   save       - typed by the player into this save
//   generated  - written by the app's one-shot (DefaultDescriptionService); yields to a default
//   online     - the shared default every player gets (ai server, edited by mappers)
//   built-in   - the default shipped in descriptions/locationDescriptions.ts
//   stock      - nothing describes it: the "suburban residence" placeholder
export type LocationSource = 'save' | 'generated' | 'online' | 'built-in' | 'stock';

// The default a location falls back to when this save has no description of its own
export type LocationDefault = {
  name: string;
  lot_type: string;
  description: string;
  source: 'online' | 'built-in';
};

export type LocationEntity = {
  id: number;
  name: string;
  lot_type: string;
  description: string;
  is_generic?: boolean;
  is_default?: boolean;
  description_generated?: number | null;
  source?: LocationSource;
  default?: LocationDefault;
  // "Starlight Boulevard, Del Sol Valley" for a shipped lot, else the world the game reported
  neighborhood?: string;
};
