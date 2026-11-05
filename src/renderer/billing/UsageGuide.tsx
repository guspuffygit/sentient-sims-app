import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SvgIconComponent } from '@mui/icons-material';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { ReactNode } from 'react';
import { useOpenPricingFromPlan } from './pricingNavigation';

type Point = { id: string; Icon: SvgIconComponent; text: ReactNode };

const HOW_IT_WORKS: Point[] = [
  { id: 'reset', Icon: RestartAltRoundedIcon, text: 'Usage resets on the 1st of every month (UTC).' },
  {
    id: 'warning',
    Icon: NotificationsActiveRoundedIcon,
    text: 'At 80%, the app and the game let you know you are close to your limit.',
  },
  {
    id: 'upgrade',
    Icon: TrendingUpRoundedIcon,
    text: "Upgrading raises your limit to the new tier's full amount, and what you've used this month counts toward it.",
  },
  {
    id: 'metering',
    Icon: ReceiptLongRoundedIcon,
    text: 'Every AI feature that goes through Sentient Sims AI counts. Usage follows the providers’ prices plus a margin for the servers, Patreon fees and the project.',
  },
];

function PricingButton() {
  const openPricing = useOpenPricingFromPlan();
  return (
    <Button size="small" onClick={openPricing} sx={{ marginLeft: -1, marginTop: 0.25, paddingY: 0 }}>
      Compare models on the Pricing page
    </Button>
  );
}

const LAST_LONGER: Point[] = [
  {
    id: 'slow',
    Icon: SpeedRoundedIcon,
    text: 'Pick the slow lane on models like Llama 3.3 70B. It costs about a fifth as much, and each reply takes a little longer.',
  },
  {
    id: 'cheaper',
    Icon: SavingsRoundedIcon,
    text: (
      <>
        Pick a cheaper model.
        <br />
        <PricingButton />
      </>
    ),
  },
  {
    id: 'keys',
    Icon: KeyRoundedIcon,
    text: 'Run any feature on your own API keys, and mix providers as you like: chat, voices, speech to text, embeddings and paintings.',
  },
];

function GuidePanel({ title, points }: { title: string; points: Point[] }) {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        backgroundColor: 'background.elevated',
      }}
    >
      <Typography variant="subtitle2" sx={{ marginBottom: 1.5 }}>
        {title}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 1.5 }}>
        {points.map(({ id, Icon, text }) => (
          <Box component="li" key={id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
            <Box
              sx={{
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                width: 28,
                height: 28,
                borderRadius: 1.5,
                color: 'primary.light',
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.14),
              }}
            >
              <Icon sx={{ fontSize: 17 }} />
            </Box>
            <Typography variant="body2" component="div" sx={{ color: 'text.secondary', paddingTop: 0.4 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function UsageGuide() {
  return (
    <Box sx={{ containerType: 'inline-size' }}>
      <Box
        sx={{
          'display': 'grid',
          'gap': 2,
          'gridTemplateColumns': '1fr',
          '@container (min-width: 720px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <GuidePanel title="How usage works" points={HOW_IT_WORKS} />
        <GuidePanel title="Make your usage last longer" points={LAST_LONGER} />
      </Box>
    </Box>
  );
}
