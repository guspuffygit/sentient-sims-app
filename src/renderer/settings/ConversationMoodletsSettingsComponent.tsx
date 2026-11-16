import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function ConversationMoodletsSettingsComponent() {
  const conversationMoodlets = useSetting(SettingsEnum.CONVERSATION_MOODLETS_ENABLED, true);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 2,
      }}
    >
      <FormControlLabel
        label="Conversations leave moodlets"
        control={
          <Checkbox
            checked={conversationMoodlets.value}
            onChange={(change) => {
              void conversationMoodlets.setSetting(change.target.checked);
            }}
          />
        }
      />
      <FormHelperText>
        When a conversation ends, the AI weighs what was said and may leave a Sentient moodlet on the Sims it moved.
        Small talk leaves nothing. This uses one extra AI call per conversation. Turn off to skip that call: only a chat
        in the chat window leaves a moodlet then.
      </FormHelperText>
    </Box>
  );
}
