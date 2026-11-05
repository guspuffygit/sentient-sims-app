import theme from 'renderer/theme';

// Each tier keeps one colour across the plan cards and the member's plan header
const TIER_ACCENTS: Record<string, string> = {
  tier1: theme.palette.info.main,
  tier2: theme.palette.primary.main,
  tier3: '#b57cec',
  tier4: theme.palette.warning.main,
};

export function tierAccent(tier?: string): string {
  return (tier && TIER_ACCENTS[tier]) || theme.palette.primary.main;
}
