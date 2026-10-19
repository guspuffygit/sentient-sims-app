import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useMemo, useState, KeyboardEvent } from 'react';
import { SimFactRecord } from 'main/sentient-sims/db/SimFactRepository';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import { alpha } from '@mui/material/styles';
import { CATEGORY_HELP, CUSTOM_CATEGORY, FactCategory, FactRow, groupFacts } from 'main/sentient-sims/util/factGroups';
import { useFactVocabulary, useSimFacts } from '../hooks/useSimFacts';

// The trust ladder. A chip appears only when a row did NOT come from the game, so the
// colour is the fastest way to spot a claim from a conversation among the game's facts.
const sourceColor: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  game: 'success',
  player: 'info',
  reflection: 'default',
  told: 'warning',
  inferred: 'warning',
};

const MAX_VALUE_LENGTH = 200;

export type SimFactsDialogProps = {
  open: boolean;
  simId?: string;
  simName?: string;
  onClose: () => void;
};

function validity(fact: SimFactRecord): string {
  const from = fact.validFromDay === undefined ? 'unknown day' : `day ${fact.validFromDay}`;
  if (fact.validToDay === undefined) {
    return `since ${from}`;
  }
  // A retired fact is history, not a mistake: it says what was true and when it stopped
  return `${from} to day ${fact.validToDay}`;
}

// The first sentence of a help text: the rest is for the developer
function firstSentence(text: string): string {
  const match = /^(.*?[.!?])(\s|$)/.exec(text);
  return match ? match[1] : text;
}

// The "?" icon the rest of the app uses for help: nothing shows until it is hovered, so
// the explanation never sits on top of the facts it explains
function HelpIcon({ title }: { title: string }) {
  if (!title) {
    return null;
  }
  return (
    <Tooltip title={title} placement="right" enterDelay={200}>
      <HelpOutlineRoundedIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
    </Tooltip>
  );
}

// The add/edit form keeps its own text: a keystroke re-renders this box alone, not the
// hundreds of rows above it, which is what made typing drag on a well-travelled Sim.
function CustomFactForm({
  editing,
  help,
  onSubmit,
  onCancel,
}: {
  editing?: SimFactRecord;
  help: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(editing?.objectText ?? '');

  const submit = () => {
    const text = value.trim();
    if (!text) {
      return;
    }
    onSubmit(text);
    setValue('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Enter sends it; Shift+Enter starts a new line
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape' && editing) {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {editing
          ? 'Editing your custom fact. The old wording is kept as history.'
          : `Add a custom fact. It appears under "${CUSTOM_CATEGORY}" at the top and the Sim always knows it.`}
      </Typography>
      {editing ? null : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Write it to the Sim in your own words, like &quot;Bosun is your dog&quot; or &quot;You have the Loyal
          trait&quot;.
        </Typography>
      )}
      <TextField
        multiline
        minRows={3}
        maxRows={6}
        fullWidth
        label="Custom fact"
        placeholder='e.g. "Bosun is your dog"'
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onKeyDown={onKeyDown}
        slotProps={{ htmlInput: { maxLength: MAX_VALUE_LENGTH }, inputLabel: { shrink: true } }}
        helperText={`${value.length}/${MAX_VALUE_LENGTH} - ${firstSentence(help)}`}
      />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
        {editing ? <Button onClick={onCancel}>Cancel</Button> : null}
        <Button variant="contained" onClick={submit} disabled={!value.trim()}>
          {editing ? 'Save' : 'Add'}
        </Button>
      </Box>
    </>
  );
}

export function SimFactsDialog({ open, simId, simName, onClose }: SimFactsDialogProps) {
  const [history, setHistory] = useState(false);
  // The custom fact being reworded, if any. The form at the bottom is shared: Edit loads
  // the row into it and Save sends the new wording in its place.
  const [editing, setEditing] = useState<SimFactRecord | undefined>();
  // Which categories the player has folded or unfolded, kept across Sims so the window
  // opens the way they left it. Unset means the category's own default.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, addFact, editFact, retireFact } = useSimFacts(open ? simId : undefined, history);
  const { help } = useFactVocabulary(open);

  const facts = useMemo(() => data?.facts ?? [], [data]);
  const names = useMemo(() => data?.names ?? {}, [data]);
  const species = useMemo(() => data?.species ?? {}, [data]);
  const relationships = useMemo(() => data?.relationships ?? {}, [data]);

  const grouped = useMemo(
    () => groupFacts({ facts, names, species, relationships }),
    [facts, names, species, relationships],
  );

  // The player's own facts always lead the list, even before the first one is added,
  // so the window reads as "yours, then the game's"
  const categories = useMemo<FactCategory<SimFactRecord>[]>(
    () =>
      grouped.categories.some((category) => category.title === CUSTOM_CATEGORY)
        ? grouped.categories
        : [{ title: CUSTOM_CATEGORY, help: CATEGORY_HELP[CUSTOM_CATEGORY], rows: [] }, ...grouped.categories],
    [grouped],
  );

  const cancelEditing = () => {
    setEditing(undefined);
  };

  const submit = (value: string) => {
    if (editing?.id !== undefined) {
      if (value !== (editing.objectText ?? '').trim()) {
        editFact(editing.id, value);
      }
      setEditing(undefined);
    } else {
      addFact({ predicate: FactPredicate.NOTE, objectText: value, source: 'player' });
    }
  };

  // Every live fact behind a row goes when the row is retired: a family row stands for
  // the genealogy edge and the family bit together
  const retireRow = (row: FactRow<SimFactRecord>) => {
    for (const fact of row.facts) {
      if (fact.id !== undefined && fact.validToDay === undefined && fact.source !== 'game') {
        if (editing?.id === fact.id) {
          cancelEditing();
        }
        retireFact(fact.id);
      }
    }
  };

  const renderRow = (row: FactRow<SimFactRecord>) => {
    const live = !row.retired;
    const editable =
      live &&
      row.source === 'player' &&
      row.facts.length === 1 &&
      row.facts[0].id !== undefined &&
      !row.facts[0].objectSimId;
    const retirable = live && row.source !== 'game' && row.facts.some((fact) => fact.id !== undefined);
    const isEditing = editing !== undefined && row.facts.some((fact) => fact.id === editing.id);
    const key = row.facts.map((fact) => fact.id ?? `${fact.predicate}:${fact.objectText ?? ''}`).join('|');
    // One date for the row: the newest fact's, which is the one that made it current
    const when = validity(row.facts[row.facts.length - 1]);
    return (
      <Box
        key={key}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.25,
          // A retired fact stays on screen, dimmed: it is history, not a mistake
          opacity: live ? 1 : 0.55,
          bgcolor: isEditing ? 'action.selected' : undefined,
        }}
      >
        <Typography variant="body2" sx={{ flex: 1 }}>
          {row.label}
          {row.detail ? (
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}
              — {row.detail}
            </Typography>
          ) : null}
        </Typography>
        {row.source !== 'game' ? (
          <Chip size="small" label={row.source} color={sourceColor[row.source] ?? 'default'} />
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 130, textAlign: 'right' }}>
          {when}
        </Typography>
        {/* Only what the player typed can be reworded: a game fact comes back with the
            next dossier, and a told fact is a record of what was said */}
        {editable ? (
          <Button
            size="small"
            onClick={() => {
              setEditing(row.facts[0]);
            }}
          >
            Edit
          </Button>
        ) : null}
        {/* No Retire on a game fact: the next dossier would assert it straight back */}
        {retirable ? (
          <Button
            size="small"
            onClick={() => {
              retireRow(row);
            }}
          >
            Retire
          </Button>
        ) : null}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>What {simName ?? 'this Sim'} knows</DialogTitle>
      <DialogContent dividers>
        {grouped.summary.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 1.25, mb: 2 }}>
            {/* Each tag under its own small heading, so "Bodybuilder (Athletic, level 10)"
                reads as the career and "Successful Lineage (Family)" as the aspiration */}
            {grouped.summary.map((item) => (
              <Box key={item.predicate} sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, pl: 0.5 }}>
                  {item.title}
                </Typography>
                <Chip size="small" label={item.label} />
              </Box>
            ))}
            <HelpIcon title="Who this Sim is right now, from the game: life stage, gender, household, career, business and aspiration." />
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
          <HelpIcon title="A fact that stopped being true is kept as history rather than deleted. Turn this on to see those too." />
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

        {(isLoading && facts.length === 0 ? [] : categories).map((category) => {
          const isExpanded = expanded[category.title] ?? !category.collapsedByDefault;
          // The player's category is a different class of thing from the game's, and
          // wears the same colour as a player-added chip so the two read as one
          const custom = category.title === CUSTOM_CATEGORY;
          return (
            <Accordion
              key={category.title}
              expanded={isExpanded}
              onChange={(_event, isOpen) => {
                setExpanded((previous) => ({ ...previous, [category.title]: isOpen }));
              }}
              disableGutters
              sx={{
                mb: custom ? 1.5 : 0.5,
                ...(custom && {
                  borderLeft: 4,
                  borderColor: 'info.main',
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.06),
                }),
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={custom ? { color: 'info.main', fontWeight: 700 } : undefined}>
                    {category.title}
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={custom ? 'info' : 'default'}
                    label={category.rows.length}
                  />
                  <HelpIcon title={firstSentence(category.help)} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {custom && category.rows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nothing added yet. Write one at the bottom of this window.
                  </Typography>
                ) : null}
                {category.groups
                  ? category.groups.map((group) => {
                      const groupKey = `${category.title}/${group.title}`;
                      const groupOpen = expanded[groupKey] ?? true;
                      return (
                        <Accordion
                          key={groupKey}
                          expanded={groupOpen}
                          onChange={(_event, isOpen) => {
                            setExpanded((previous) => ({ ...previous, [groupKey]: isOpen }));
                          }}
                          disableGutters
                          variant="outlined"
                          // A boxed, bold sub-heading: the plain version floated in the
                          // list and did not look like something to click
                          sx={{ 'mb': 0.75, 'borderRadius': 1, '&:before': { display: 'none' } }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon fontSize="small" />}
                            sx={{ minHeight: 36, bgcolor: 'action.hover' }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {group.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {group.rows.length}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, pl: 3 }}>{group.rows.map(renderRow)}</AccordionDetails>
                        </Accordion>
                      );
                    })
                  : category.rows.map(renderRow)}
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Divider sx={{ my: 2 }} />
        <CustomFactForm
          // A fresh form per edit, so the box fills with the row being reworded
          key={editing?.id ?? 'new'}
          editing={editing}
          help={help[FactPredicate.NOTE] ?? ''}
          onSubmit={submit}
          onCancel={cancelEditing}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SimFactsDialog;
