import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import log from 'electron-log';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { DirectedSceneRequest } from 'main/sentient-sims/models/DirectedSceneRequest';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { defaultSimDescriptions } from 'main/sentient-sims/descriptions/simDescriptions';
import { CharacterScenarioPanel, CharacterScenarioState } from './CharacterScenarioPanel';
import {
  CareerOption,
  getCareerOptions,
  getInteractionOptions,
  getLocationOptions,
  getMoodOptions,
  getTraitOptions,
  InteractionOption,
  LocationOption,
  TraitOption,
} from './scenarioOptions';

const randomNamePool = Array.from(defaultSimDescriptions.keys());

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomSubset<T>(items: T[], min: number, max: number): T[] {
  if (items.length === 0) return [];
  const count = Math.min(items.length, Math.floor(Math.random() * (max - min + 1)) + min);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomCharacter(
  traitOptions: TraitOption[],
  moodOptions: TraitOption[],
  careerOptions: CareerOption[],
  usedNames: Set<string>,
): CharacterScenarioState {
  const availableNames = randomNamePool.filter((name) => !usedNames.has(name));
  const name = pickRandom(availableNames.length > 0 ? availableNames : randomNamePool) ?? 'Random Sim';
  usedNames.add(name);

  return {
    name,
    traits: pickRandomSubset(traitOptions, 2, 4),
    moods: pickRandomSubset(moodOptions, 1, 2),
    career: pickRandom(careerOptions) ?? null,
  };
}

const defaultCharacter1: CharacterScenarioState = {
  name: 'Ricky Rickerson',
  traits: [],
  moods: [],
  career: null,
};

const defaultCharacter2: CharacterScenarioState = {
  name: 'Richy Richardson',
  traits: [],
  moods: [],
  career: null,
};

function generateSimId(): string {
  // Sim IDs from the game are large positive integers (see ParticipantRepository, which does
  // BigInt(sim_id)) — a UUID isn't valid here, so generate an 18-digit numeric string instead.
  let id = '';
  for (let i = 0; i < 18; i += 1) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id.replace(/^0+/, '') || '1';
}

function toSentientSim(character: CharacterScenarioState, isPlayerSim: boolean): SentientSim {
  return {
    name: character.name,
    age: SimAge.ADULT,
    sim_id: generateSimId(),
    gender: 'Male',
    traits: character.traits.map((trait) => trait.key),
    moods: character.moods.map((mood) => mood.key),
    careers: character.career
      ? [{ name: character.career.careerKey, track_name: character.career.trackKey, level: character.career.level }]
      : [],
    is_ghost: false,
    grubby: false,
    in_pool: false,
    is_at_home: isPlayerSim,
    is_dying: false,
    is_human: true,
    is_inside_building: false,
    is_outside: true,
    is_pet: false,
    on_fire: false,
    on_home_lot: isPlayerSim,
    sleeping: false,
    is_pregnant: false,
    is_player_sim: isPlayerSim,
  };
}

const modelsClient = new AIClient();

export type ScenarioTesterComponentProps = {
  onGenerate: (event: InteractionEvent) => void;
  onGenerateDirected: (request: DirectedSceneRequest) => void;
  loading: boolean;
};

export function ScenarioTesterComponent({ onGenerate, onGenerateDirected, loading }: ScenarioTesterComponentProps) {
  const traitOptions = useMemo(() => getTraitOptions(), []);
  const moodOptions = useMemo(() => getMoodOptions(), []);
  const careerOptions = useMemo(() => getCareerOptions(), []);
  const locationOptions = useMemo(() => getLocationOptions(), []);
  const interactionOptions = useMemo(() => getInteractionOptions(), []);

  const [character1, setCharacter1] = useState<CharacterScenarioState>(defaultCharacter1);
  const [character2, setCharacter2] = useState<CharacterScenarioState>(defaultCharacter2);
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [interaction, setInteraction] = useState<InteractionOption | null>(null);
  const [action, setAction] = useState('');
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [directorModel, setDirectorModel] = useState('');
  const [actor1Model, setActor1Model] = useState('');
  const [actor2Model, setActor2Model] = useState('');

  useEffect(() => {
    modelsClient
      .getModels()
      .then((models) => {
        setModelOptions(models.map((model) => model.name));
        return models;
      })
      .catch((err: unknown) => {
        log.debug('Unable to fetch model list for scenario tester', err);
      });
  }, []);

  const buildEvent = (): InteractionEvent => {
    const sim1 = toSentientSim(character1, true);
    const sim2 = toSentientSim(character2, false);

    return {
      event_id: crypto.randomUUID(),
      event_type: SSEventType.INTERACTION,
      location_id: location?.id ?? 0,
      environment: {
        location_id: location?.id ?? 0,
        world_id: 0,
        time: { second: 0, minute: 0, hour: 12, day: 0, week: 0 },
      },
      sentient_sims: [sim1, sim2],
      interaction_name: interaction?.key ?? 'scenario_tester_custom_action',
      testing_action: action || interaction?.sampleAction,
    };
  };

  const handleGenerate = () => {
    onGenerate(buildEvent());
  };

  const handleGenerateDirected = () => {
    onGenerateDirected({
      event: buildEvent(),
      directorModel: directorModel || undefined,
      actorModels: [actor1Model || undefined, actor2Model || undefined],
    });
  };

  const handleRandomize = () => {
    const usedNames = new Set<string>();
    setCharacter1(randomCharacter(traitOptions, moodOptions, careerOptions, usedNames));
    setCharacter2(randomCharacter(traitOptions, moodOptions, careerOptions, usedNames));
    setLocation(pickRandom(locationOptions) ?? null);
    const randomInteraction = pickRandom(interactionOptions) ?? null;
    setInteraction(randomInteraction);
    setAction(randomInteraction?.sampleAction ?? '');
  };

  return (
    <Box sx={{ px: 2, py: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
        <CharacterScenarioPanel
          title="Character 1 (player)"
          state={character1}
          onChange={setCharacter1}
          traitOptions={traitOptions}
          moodOptions={moodOptions}
          careerOptions={careerOptions}
        />
        <CharacterScenarioPanel
          title="Character 2"
          state={character2}
          onChange={setCharacter2}
          traitOptions={traitOptions}
          moodOptions={moodOptions}
          careerOptions={careerOptions}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
        <Autocomplete
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          options={locationOptions}
          value={location}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, value) => {
            setLocation(value);
          }}
          renderInput={(params) => <TextField {...params} label="Location" />}
        />
        <Autocomplete
          size="small"
          sx={{ flex: 1, minWidth: 260 }}
          options={interactionOptions}
          value={interaction}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          onChange={(_event, value) => {
            setInteraction(value);
            if (value?.sampleAction) {
              setAction(value.sampleAction);
            }
          }}
          renderInput={(params) => <TextField {...params} label="Interaction" />}
        />
      </Stack>
      <TextField
        label="Action (uses {actor.0} / {actor.1} / {participants} placeholders)"
        size="small"
        fullWidth
        multiline
        value={action}
        onChange={(event) => {
          setAction(event.target.value);
        }}
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Models (blank = configured default)
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1, mt: 0.5 }}>
        <Autocomplete
          freeSolo
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          options={modelOptions}
          inputValue={directorModel}
          onInputChange={(_event, value) => {
            setDirectorModel(value);
          }}
          renderInput={(params) => <TextField {...params} label="Director model" />}
        />
        <Autocomplete
          freeSolo
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          options={modelOptions}
          inputValue={actor1Model}
          onInputChange={(_event, value) => {
            setActor1Model(value);
          }}
          renderInput={(params) => <TextField {...params} label={`Actor model: ${character1.name}`} />}
        />
        <Autocomplete
          freeSolo
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          options={modelOptions}
          inputValue={actor2Model}
          onInputChange={(_event, value) => {
            setActor2Model(value);
          }}
          renderInput={(params) => <TextField {...params} label={`Actor model: ${character2.name}`} />}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={handleRandomize} disabled={loading}>
          Randomize
        </Button>
        <Button variant="contained" onClick={handleGenerateDirected} disabled={loading}>
          Run Directed Scene
        </Button>
        <Button variant="outlined" onClick={handleGenerate} disabled={loading}>
          Single-Pass Scenario
        </Button>
      </Stack>
    </Box>
  );
}
