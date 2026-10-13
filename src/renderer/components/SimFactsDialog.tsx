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
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { SimFactRecord } from 'main/sentient-sims/db/SimFactRepository';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import { enumWords, factValueWords } from 'main/sentient-sims/util/factWords';
import { useFactVocabulary, useSimFacts } from '../hooks/useSimFacts';

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

// What goes in the Value box for each kind of fact. The note is the one most players
// want: a blank line the Sim will always carry.
const valuePlaceholder: Record<string, string> = {
  [FactPredicate.NOTE]: 'Write it to the Sim, e.g. "Bosun is your dog"',
  [FactPredicate.SPECIES]: 'dog, cat, small dog, fox or horse',
  [FactPredicate.PRONOUNS]: 'he/him, she/her or they/them',
};

const MAX_VALUE_LENGTH = 200;

// The player's word for a predicate: the note is "always know", the rest are the
// predicate with the underscores taken out.
function predicateLabel(predicate: string): string {
  if (predicate === FactPredicate.NOTE) {
    return 'always know (free text)';
  }
  return predicate.replace(/_/g, ' ');
}

export type SimFactsDialogProps = {
  open: boolean;
  simId?: string;
  simName?: string;
  onClose: () => void;
};

// The value in plain words: a name for an edge (with the species for a pet), and the
// game's identifier said the way the prompt says it for everything else.
function factObject(fact: SimFactRecord, names: Record<string, string>, species: Record<string, string>): string {
  if (fact.objectSimId) {
    const name = names[fact.objectSimId] ?? `sim ${fact.objectSimId}`;
    const kind = species[fact.objectSimId];
    return kind ? `${name} (${enumWords(kind)})` : name;
  }
  return fact.objectText ? factValueWords(fact.predicate, fact.objectText) : '';
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
  const [newPredicate, setNewPredicate] = useState<string>(FactPredicate.NOTE);
  const [newObject, setNewObject] = useState('');
  // The player fact being reworded, if any. The form at the bottom is shared: Edit loads
  // the row into it and Save sends the new wording in its place.
  const [editing, setEditing] = useState<SimFactRecord | undefined>();

  const { data, isLoading, error, addFact, editFact, retireFact } = useSimFacts(open ? simId : undefined, history);
  const { attributes, help } = useFactVocabulary(open);

  const facts = useMemo(() => data?.facts ?? [], [data]);
  const names = data?.names ?? {};
  const species = data?.species ?? {};

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

  const startEditing = (fact: SimFactRecord) => {
    setEditing(fact);
    setNewPredicate(fact.predicate);
    setNewObject(fact.objectText ?? '');
  };

  const cancelEditing = () => {
    setEditing(undefined);
    setNewObject('');
  };

  const submit = () => {
    const value = newObject.trim();
    if (!newPredicate || !value) {
      return;
    }
    if (editing?.id !== undefined) {
      if (value !== (editing.objectText ?? '').trim()) {
        editFact(editing.id, value);
      }
      setEditing(undefined);
    } else {
      addFact({ predicate: newPredicate, objectText: value, source: 'player' });
    }
    setNewObject('');
  };

  const describe = (predicate: string) => help[predicate] ?? '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>What {simName ?? 'this Sim'} knows</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Tooltip title="A fact that stopped being true is kept as history rather than deleted. Turn this on to see those too.">
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
          </Tooltip>
          {isLoading ? <CircularProgress size={20} /> : null}
        </Box>

        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {!isLoading && facts.length === 0 ? (
          <Typography color="text.secondary">
            No facts yet. They arrive from the game once a dossier is reported for this Sim, and you can add your own
            below.
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
            {group.facts.map((fact, index) => {
              const live = fact.validToDay === undefined && fact.id !== undefined;
              const isEditing = editing !== undefined && editing.id === fact.id;
              return (
                <Box
                  key={fact.id ?? `row-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                    // A retired fact stays on screen, dimmed: it is history, not a mistake
                    opacity: fact.validToDay === undefined ? 1 : 0.55,
                    bgcolor: isEditing ? 'action.selected' : undefined,
                  }}
                >
                  {/* Hover the kind of fact to read what it means: "household" is the family
                      name on the mailbox, not the list of people, and nothing on the row says so */}
                  <Tooltip title={describe(fact.predicate)} placement="top-start" enterDelay={300}>
                    <Typography
                      sx={{ minWidth: 160, cursor: 'help', textDecoration: 'underline dotted' }}
                      variant="body2"
                    >
                      {predicateLabel(fact.predicate)}
                    </Typography>
                  </Tooltip>
                  <Typography sx={{ flex: 1 }} variant="body2">
                    {factObject(fact, names, species)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                    {validity(fact)}
                  </Typography>
                  {/* Only what the player typed can be reworded: a game fact comes back with
                      the next dossier, and a told fact is a record of what was said */}
                  {live && fact.source === 'player' && !fact.objectSimId ? (
                    <Button
                      size="small"
                      onClick={() => {
                        startEditing(fact);
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                  {/* No Retire on a game fact: the next dossier would assert it straight back */}
                  {live && fact.source !== 'game' ? (
                    <Button
                      size="small"
                      onClick={() => {
                        if (isEditing) {
                          cancelEditing();
                        }
                        retireFact(fact.id as number);
                      }}
                    >
                      Retire
                    </Button>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {editing
            ? `Editing your "${predicateLabel(editing.predicate)}" fact. The old wording is kept as history.`
            : 'Add a fact. It is stored as yours, and the game still overrides it.'}
        </Typography>
        {editing ? null : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Pick &quot;always know&quot; to write anything you like in your own words. The Sim reads it in every scene,
            exactly as written.
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            select
            size="small"
            label="Kind of fact"
            value={newPredicate}
            disabled={editing !== undefined}
            onChange={(event) => {
              setNewPredicate(event.target.value);
            }}
            helperText={describe(newPredicate)}
            sx={{ minWidth: 220, maxWidth: 320 }}
          >
            {attributes.map((predicate) => (
              <MenuItem key={predicate} value={predicate}>
                <Tooltip title={describe(predicate)} placement="right" enterDelay={300}>
                  <Box component="span" sx={{ display: 'block', width: '100%' }}>
                    {predicateLabel(predicate)}
                  </Box>
                </Tooltip>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Value"
            placeholder={valuePlaceholder[newPredicate]}
            value={newObject}
            onChange={(event) => {
              setNewObject(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              } else if (event.key === 'Escape' && editing) {
                event.stopPropagation();
                cancelEditing();
              }
            }}
            slotProps={{ htmlInput: { maxLength: MAX_VALUE_LENGTH }, inputLabel: { shrink: true } }}
            helperText={`${newObject.length}/${MAX_VALUE_LENGTH}`}
            sx={{ flex: 1 }}
          />
          <Button onClick={submit} disabled={!newPredicate || !newObject.trim()} sx={{ mt: 0.5 }}>
            {editing ? 'Save' : 'Add'}
          </Button>
          {editing ? (
            <Button onClick={cancelEditing} sx={{ mt: 0.5 }}>
              Cancel
            </Button>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SimFactsDialog;
