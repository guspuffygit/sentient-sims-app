import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function DirectedScenesSettingsComponent() {
  const directedScenesEnabled = useSetting(SettingsEnum.DIRECTED_SCENES_ENABLED, true);
  const pipelineMode = useSetting<string>(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');

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
      <FormControl size="small" sx={{ marginTop: 2, maxWidth: 320 }} disabled={!directedScenesEnabled.value}>
        <InputLabel id="scene-pipeline-mode-label">Scene pipeline</InputLabel>
        <Select
          labelId="scene-pipeline-mode-label"
          label="Scene pipeline"
          value={pipelineMode.value === 'full' ? 'full' : 'lean'}
          onChange={(change) => {
            void pipelineMode.setSetting(change.target.value);
          }}
        >
          <MenuItem value="lean">Lean</MenuItem>
          <MenuItem value="full">Full</MenuItem>
        </Select>
        <FormHelperText>
          Lean: one call per Sim per round, no director, no reviewer. Full: the 4.6 pipeline.
        </FormHelperText>
      </FormControl>
    </Box>
  );
}
