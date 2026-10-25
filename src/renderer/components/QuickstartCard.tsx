import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { useNavigate } from 'react-router-dom';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultVoiceInputHotkeyFor } from 'main/sentient-sims/constants';
import { voiceHotkeyLabel } from 'main/sentient-sims/models/VoiceHotkeyPresets';
import useSetting from 'renderer/hooks/useSetting';
import AppCard from 'renderer/AppCard';

type QuickstartListProps = {
  onOpenVoiceSettings?: () => void;
};

// The four things a new player needs to know, with their real talk key
export function QuickstartList({ onOpenVoiceSettings }: QuickstartListProps) {
  const { isMac } = window.electron;
  const ttsEnabled = useSetting<boolean>(SettingsEnum.TTS_ENABLED, true);
  const voiceInputEnabled = useSetting<boolean>(SettingsEnum.VOICE_INPUT_ENABLED, true);
  const hotkey = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY, defaultVoiceInputHotkeyFor(isMac));
  const hotkeyMode = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'hold');
  const key = voiceHotkeyLabel(hotkey.value, isMac);

  const rows = [
    {
      icon: <TouchAppOutlinedIcon fontSize="small" />,
      text: 'Click a Sim, open Sentient Sims, and pick Chat or Do Something.',
    },
    voiceInputEnabled.value
      ? {
          icon: <MicNoneOutlinedIcon fontSize="small" />,
          text:
            hotkeyMode.value === 'toggle'
              ? `Press ${key} in the game to talk to your Sim, and press it again when you're done.`
              : `Hold ${key} in the game and talk to your Sim. Let go when you're done.`,
        }
      : {
          icon: <MicNoneOutlinedIcon fontSize="small" />,
          text: 'You can talk to your Sims with your microphone. Turn on Voice Input in the Voice settings.',
          voiceSettings: true,
        },
    {
      icon: <MenuBookOutlinedIcon fontSize="small" />,
      text: 'Press Ctrl+M in the game to open the memories window: everything your Sims said and remember.',
    },
    ttsEnabled.value
      ? {
          icon: <RecordVoiceOverOutlinedIcon fontSize="small" />,
          text: 'Your Sims speak out loud, so turn your sound up.',
        }
      : {
          icon: <RecordVoiceOverOutlinedIcon fontSize="small" />,
          text: 'Your Sims can talk out loud! Turn on Text to Speech in the Voice settings.',
          voiceSettings: true,
        },
  ];

  return (
    <List dense disablePadding>
      {rows.map((row) => (
        <ListItem key={row.text} disableGutters>
          <ListItemIcon sx={{ minWidth: 34, color: 'primary.light' }}>{row.icon}</ListItemIcon>
          <ListItemText primary={row.text} slotProps={{ primary: { variant: 'body2' } }} />
          {'voiceSettings' in row && onOpenVoiceSettings ? (
            <Button size="small" onClick={onOpenVoiceSettings} sx={{ flexShrink: 0 }}>
              Voice settings
            </Button>
          ) : null}
        </ListItem>
      ))}
    </List>
  );
}

// Home page card, shown until the player closes it
export function QuickstartCard() {
  const dismissed = useSetting<boolean>(SettingsEnum.QUICKSTART_DISMISSED, false);
  const navigate = useNavigate();

  if (dismissed.isLoading || dismissed.value) {
    return null;
  }

  return (
    <AppCard
      title="How to play"
      headerAction={
        <Tooltip title="Hide">
          <IconButton size="small" onClick={() => void dismissed.setSetting(true)} aria-label="Hide how to play">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <Box>
        <QuickstartList onOpenVoiceSettings={() => void navigate('/settings')} />
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
          Having any trouble at all? Run the Setup Wizard from Settings.
        </Typography>
      </Box>
    </AppCard>
  );
}
