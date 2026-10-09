import type { AIActionType } from 'main/sentient-sims/models/AIActionType';
import type { RouteObject } from 'react-router-dom';
import type { ComponentType } from 'react';
import type {
  MemoryTraceDialogProps,
  RendererTier,
  TierNavItem,
  TierSettingsRow,
  TierSettingsTab,
  VoiceCommandRowProps,
} from './types';
import { RENDERER_TIERS } from './index';

export type MergedRendererTiers = {
  routes: RouteObject[];
  navItems: TierNavItem[];
  settingsTabs: TierSettingsTab[];
  settingsRows: TierSettingsRow[];
  overrideActionTypes: AIActionType[];
  voiceCommandRow?: ComponentType<VoiceCommandRowProps>;
  MemoryTraceDialog?: ComponentType<MemoryTraceDialogProps>;
};

export function mergeRendererTiers(tiers: RendererTier[]): MergedRendererTiers {
  return {
    routes: tiers.flatMap((t) => t.routes ?? []),
    navItems: tiers.flatMap((t) => t.navItems ?? []),
    settingsTabs: tiers.flatMap((t) => t.settingsTabs ?? []),
    settingsRows: tiers.flatMap((t) => t.settingsRows ?? []),
    overrideActionTypes: tiers.flatMap((t) => t.overrideActionTypes ?? []),
    voiceCommandRow: tiers.find((t) => t.voiceCommandRow)?.voiceCommandRow,
    MemoryTraceDialog: tiers.find((t) => t.MemoryTraceDialog)?.MemoryTraceDialog,
  };
}

export const rendererTiers: MergedRendererTiers = mergeRendererTiers(RENDERER_TIERS);
