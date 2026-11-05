import {
  Box,
  Button,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { SentientSimsAISpeechModel } from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import AppCard from 'renderer/AppCard';
import { formatDate, formatMultiplier, sortedChatCosts } from './membershipView';
import { useRateCard } from './useRateCard';
import { usePricingBack } from './pricingNavigation';

const VOICE_NAMES: { [model: string]: string } = {
  kokoro: 'Kokoro',
  orpheus: 'Orpheus',
  [SentientSimsAISpeechModel.ELEVEN_V4_TURBO]: 'ElevenLabs v4 Turbo (Tier 3 and Tier 4)',
};

export default function PricingPage() {
  const back = usePricingBack();
  const card = useRateCard();

  return (
    <AppCard
      title="Pricing"
      subtitle="What each model takes from your monthly usage, next to the 1x baseline"
      headerAction={
        <Button size="small" onClick={back}>
          Back
        </Button>
      }
    >
      {card.isLoading ? <FormHelperText>Loading…</FormHelperText> : null}
      {card.isError ? <FormHelperText error>{card.error.message}</FormHelperText> : null}
      {card.data ? (
        <Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Chat model</TableCell>
                <TableCell align="right">Fast cost</TableCell>
                <TableCell align="right">Slow cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedChatCosts(card.data).map(([model, cost]) => (
                <TableRow key={model}>
                  <TableCell>
                    {model}
                    {model === card.data.base_chat ? (
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', marginLeft: 1 }}>
                        baseline
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">{formatMultiplier(cost.fast)}</TableCell>
                  <TableCell align="right">
                    {cost.slow !== undefined && cost.slow !== cost.fast ? formatMultiplier(cost.slow) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table size="small" sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Voice</TableCell>
                <TableCell align="right">Cost per character</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(card.data.voices)
                .sort(([, a], [, b]) => a - b)
                .map(([model, cost]) => (
                  <TableRow key={model}>
                    <TableCell>{VOICE_NAMES[model] ?? model}</TableCell>
                    <TableCell align="right">{formatMultiplier(cost)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <Table size="small" sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Embedding model (memory search)</TableCell>
                <TableCell align="right">Cost per token</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(card.data.embeddings)
                .sort(([aName, a], [bName, b]) => a - b || aName.localeCompare(bName))
                .map(([model, cost]) => (
                  <TableRow key={model}>
                    <TableCell>{model}</TableCell>
                    <TableCell align="right">{formatMultiplier(cost)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <FormHelperText>
            Chat and embedding costs are per token sent, relative to {card.data.base_chat} at 1x. Voices are relative to
            Kokoro. A model with no slow cost costs the same on both lanes. Costs as of{' '}
            {formatDate(card.data.as_of) ?? card.data.as_of}.
          </FormHelperText>
        </Box>
      ) : null}
    </AppCard>
  );
}
