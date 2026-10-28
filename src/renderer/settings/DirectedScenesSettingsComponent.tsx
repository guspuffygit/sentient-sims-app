import { Box, Checkbox, FormControlLabel, FormHelperText, Switch } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

// The second of the two switches Jaz tests (2026-10-28): on, the lean voice pipeline (one actor
// call per Sim per round, the game's beat carried into every round, no director briefing, no
// reviewer, no per-round scores); off, the 4.6 pipeline untouched. The setting underneath is
// scenePipelineMode 'lean' | 'full'. Flipping it takes effect on the next scene; no restart.
export default function DirectedScenesSettingsComponent() {
  const directedScenesEnabled = useSetting(SettingsEnum.DIRECTED_SCENES_ENABLED, true);
  const pipelineMode = useSetting<string>(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');
  const lean = pipelineMode.value !== 'full';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 2,
      }}
    >
      <FormControlLabel
        label="Directed Scenes"
        control={
          <Checkbox
            checked={directedScenesEnabled.value}
            onChange={(change) => {
              void directedScenesEnabled.setSetting(change.target.checked);
            }}
          />
        }
      />
      <FormHelperText>
        Screenplay-style dialogue scenes with a director pass, per-character voices, and paced in-game subtitles.
        Disable to return to the classic narrated-story playstyle.
      </FormHelperText>
      <FormControlLabel
        sx={{ marginTop: 2 }}
        label="Lean voice pipeline"
        disabled={!directedScenesEnabled.value}
        control={
          <Switch
            checked={lean}
            onChange={(change) => {
              void pipelineMode.setSetting(change.target.checked ? 'lean' : 'full');
            }}
          />
        }
      />
      <FormHelperText>
        On: one call per Sim per round, the scene&apos;s beat carried into every round, no director briefing, no
        reviewer, no per-round scores (about a third of the tokens, a line in ~1.5 s instead of ~5 s). Off: the 4.6
        pipeline as shipped, director, reviewer and scores included.
      </FormHelperText>
    </Box>
  );
}
