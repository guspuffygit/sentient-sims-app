import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { CareerOption, TraitOption } from './scenarioOptions';

export type CharacterScenarioState = {
  name: string;
  traits: TraitOption[];
  moods: TraitOption[];
  career: CareerOption | null;
};

export type CharacterScenarioPanelProps = {
  title: string;
  state: CharacterScenarioState;
  onChange: (state: CharacterScenarioState) => void;
  traitOptions: TraitOption[];
  moodOptions: TraitOption[];
  careerOptions: CareerOption[];
};

export function CharacterScenarioPanel({
  title,
  state,
  onChange,
  traitOptions,
  moodOptions,
  careerOptions,
}: CharacterScenarioPanelProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 260 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <TextField
        label="Name"
        size="small"
        fullWidth
        value={state.name}
        onChange={(event) => {
          onChange({ ...state, name: event.target.value });
        }}
        sx={{ mb: 1 }}
      />
      <Autocomplete
        multiple
        size="small"
        options={traitOptions}
        value={state.traits}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        onChange={(_event, value) => {
          onChange({ ...state, traits: value });
        }}
        renderInput={(params) => <TextField {...params} label="Traits" />}
        sx={{ mb: 1 }}
      />
      <Autocomplete
        multiple
        size="small"
        options={moodOptions}
        value={state.moods}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        onChange={(_event, value) => {
          onChange({ ...state, moods: value });
        }}
        renderInput={(params) => <TextField {...params} label="Moods" />}
        sx={{ mb: 1 }}
      />
      <Autocomplete
        size="small"
        options={careerOptions}
        value={state.career}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) =>
          option.careerKey === value.careerKey && option.trackKey === value.trackKey && option.level === value.level
        }
        onChange={(_event, value) => {
          onChange({ ...state, career: value });
        }}
        renderInput={(params) => <TextField {...params} label="Career" />}
      />
    </Box>
  );
}
