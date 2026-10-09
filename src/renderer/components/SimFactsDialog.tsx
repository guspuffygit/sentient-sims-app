import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { SimFactRecord } from 'main/sentient-sims/db/SimFactRepository';
import { useAttributePredicates, useSimFacts } from '../hooks/useSimFacts';

// The trust ladder, in the order the store applies it. Colour is the fastest way to see
// that a claim came from a conversation rather than from the game.
const sourceColor: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  game: 'success',
  player: 'info',
  reflection: 'default',
  told: 'warning',
  inferred: 'warning',
};

const sourceOrder = ['game', 'player', 'reflection', 'told', 'inferred'];

const sourceNote: Record<string, string> = {
  game: 'from the game itself, and always wins',
  player: 'entered by you',
  told: 'said to this Sim, and may not be true',
  inferred: 'read out of a memory by a model',
  reflection: 'written by this Sim in a diary',
};

export type SimFactsDialogProps = {
  open: boolean;
  simId?: string;
  simName?: string;
  onClose: () => void;
};

function factObject(fact: SimFactRecord, names: Record<string, string>): string {
  if (fact.objectSimId) {
    return names[fact.objectSimId] ?? `sim ${fact.objectSimId}`;
  }
  return fact.objectText ?? '';
}

function validity(fact: SimFactRecord): string {
  const from = fact.validFromDay === undefined ? 'unknown day' : `day ${fact.validFromDay}`;
  if (fact.validToDay === undefined) {
    return `since ${from}`;
  }
  // A retired fact is history, not a mistake: it says what was true and when it stopped
  return `${from} to day ${fact.validToDay}`;
}

export function SimFactsDialog({ open, simId, simName, onClose }: SimFactsDialogProps) {
  const [history, setHistory] = useState(false);
  const [newPredicate, setNewPredicate] = useState('');
  const [newObject, setNewObject] = useState('');

  const { data, isLoading, error, addFact, retireFact } = useSimFacts(open ? simId : undefined, history);
  const predicates = useAttributePredicates(open);

  const facts = useMemo(() => data?.facts ?? [], [data]);
  const names = data?.names ?? {};

  const grouped = useMemo(() => {
    const bySource = new Map<string, SimFactRecord[]>();
    for (const fact of facts) {
      const list = bySource.get(fact.source) ?? [];
      list.push(fact);
      bySource.set(fact.source, list);
    }
    return sourceOrder
      .filter((source) => bySource.has(source))
      .map((source) => ({ source, facts: bySource.get(source) ?? [] }));
  }, [facts]);

  const submit = () => {
    const value = newObject.trim();
    if (!newPredicate || !value) {
      return;
    }
    addFact({ predicate: newPredicate, objectText: value, source: 'player' });
    setNewObject('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>What {simName ?? 'this Sim'} knows</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={history}
                onChange={(event) => {
                  setHistory(event.target.checked);
                }}
              />
            }
            label="Include retired facts"
          />
          {isLoading ? <CircularProgress size={20} /> : null}
        </Box>

        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {!isLoading && facts.length === 0 ? (
          <Typography color="text.secondary">
            No facts yet. They arrive from the game once a dossier is reported for this Sim.
          </Typography>
        ) : null}

        {grouped.map((group) => (
          <Box key={group.source} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip size="small" label={group.source} color={sourceColor[group.source] ?? 'default'} />
              <Typography variant="body2" color="text.secondary">
                {sourceNote[group.source] ?? `${group.facts.length} facts`}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {group.facts.map((fact, index) => (
              <Box
                key={fact.id ?? `row-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  // A retired fact stays on screen, dimmed: it is history, not a mistake
                  opacity: fact.validToDay === undefined ? 1 : 0.55,
                }}
              >
                <Typography sx={{ minWidth: 160 }} variant="body2">
                  {fact.predicate.replace(/_/g, ' ')}
                </Typography>
                <Typography sx={{ flex: 1 }} variant="body2">
                  {factObject(fact, names)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                  {validity(fact)}
                </Typography>
                {/* No Retire on a game fact: the next dossier would assert it straight back */}
                {fact.validToDay === undefined && fact.source !== 'game' && fact.id !== undefined ? (
                  <Button
                    size="small"
                    onClick={() => {
                      retireFact(fact.id as number);
                    }}
                  >
                    Retire
                  </Button>
                ) : null}
              </Box>
            ))}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Add a fact. It is stored as yours, and the game still overrides it.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            select
            size="small"
            label="Predicate"
            value={newPredicate}
            onChange={(event) => {
              setNewPredicate(event.target.value);
            }}
            sx={{ minWidth: 200 }}
          >
            {predicates.map((predicate) => (
              <MenuItem key={predicate} value={predicate}>
                {predicate.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Value"
            value={newObject}
            onChange={(event) => {
              setNewObject(event.target.value);
            }}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            sx={{ flex: 1 }}
          />
          <Button onClick={submit} disabled={!newPredicate || !newObject.trim()}>
            Add
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SimFactsDialog;
