// Renderer half of the build tiers (release 4.5). Core pages ask the merged tier list
// (merge.ts over the generated index.tsx) for anything a stripped build may not have:
// routes, nav buttons, settings tabs and rows. A tier's renderer entry (stream.tsx,
// autonomy.tsx, dev.tsx) is deleted with the rest of the tier.
import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { AIActionType } from 'main/sentient-sims/models/AIActionType';
import type { TierLayer } from 'main/sentient-sims/tiers/types';

export type TierNavItem = { id: string; label: string; path: string };

export type TierSettingsTab = { value: string; label: string; Component: ComponentType };

// Rows on the main Settings tab, after the Directed Scenes row.
export type TierSettingsRow = { id: string; Component: ComponentType };

export type HotkeyPreset = { value: string; label: string };

// The voice settings' second chord (an order, not talk). Given the talk key so it is never
// offered the same chord twice.
export type VoiceCommandRowProps = { talkHotkey: string; presets: HotkeyPreset[] };

export type MemoryTraceDialogProps = { open: boolean; memoryId?: string; onClose: () => void };

export interface RendererTier {
  name: TierLayer;
  routes?: RouteObject[];
  // Debug-mode nav buttons
  navItems?: TierNavItem[];
  settingsTabs?: TierSettingsTab[];
  settingsRows?: TierSettingsRow[];
  // AI action types only this tier generates; the provider-override table lists them
  overrideActionTypes?: AIActionType[];
  voiceCommandRow?: ComponentType<VoiceCommandRowProps>;
  // The Memories window's "View Prompt" (dev)
  MemoryTraceDialog?: ComponentType<MemoryTraceDialogProps>;
}
