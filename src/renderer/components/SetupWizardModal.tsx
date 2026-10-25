import {
  Button,
  Modal,
  Box,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Switch,
  Typography,
  Zoom,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  MenuItem,
  Select,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Dispatch, Fragment, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { ModsDirectoryComponent } from 'renderer/ModsDirectoryComponent';
import { useVersions } from 'renderer/providers/VersionsProvider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from '@mui/icons-material/Close';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { AIStatusComponent } from 'renderer/AIStatusComponent';
import { ApiType, ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { ProviderConnectionPanel } from 'renderer/settings/ProviderConnectionPanel';
import { useWebsocket } from 'renderer/providers/WebsocketProvider';
import useSetting from 'renderer/hooks/useSetting';
import { WizardPage } from 'main/sentient-sims/models/WizardPage';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useModUpdate } from 'renderer/providers/ModUpdateProvider';
import { appApiUrl, defaultVoiceInputHotkeyFor, patreonMembershipUrl } from 'main/sentient-sims/constants';
import { voiceHotkeyLabel } from 'main/sentient-sims/models/VoiceHotkeyPresets';
import { ElevenLabsKeySetup } from 'renderer/settings/voice/ElevenLabsKeySetup';
import { VoiceHotkeyRow } from 'renderer/settings/voice/VoiceInputSettingsComponent';
import { PatreonButton } from 'renderer/PatreonComponent';
import { LoginComponent } from './LoginComponent';
import { PatreonLinkingComponent } from './PatreonLinkingComponent';
import { PatreonSubscribingComponent } from './PatreonSubscribingComponent';
import { QuickstartList } from './QuickstartCard';

const optionsClient = new SentientSimsAppClient();

export type SetupWizardModalParameters = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

interface PageProps {
  setPage: (wizardPage: WizardPage) => void;

  // Marks setup done and closes the wizard
  finish?: () => void;
}

type WizardStepProps = {
  title?: string;
  description?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
  maxWidth?: number;
};

// Shared step layout: a scrollable centered content column with a pinned footer,
// so every page gets the same rhythm without absolute positioning
function WizardStep({ title, description, actions, children, maxWidth = 560 }: WizardStepProps) {
  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth, marginY: 'auto', paddingY: 2 }}>
          {title ? (
            <Typography variant="h6" align="center" sx={{ marginBottom: description ? 0.75 : 2.5 }}>
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', marginBottom: 2.5 }}>
              {description}
            </Typography>
          ) : null}
          {children}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1.5,
          paddingTop: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {actions}
      </Box>
    </>
  );
}

// The Sentient Sims plumbob, served from the app's assets
function PlumbobLogo({ size }: { size: number }) {
  return (
    <Box
      component="img"
      src={`${appApiUrl}/files/icon.png`}
      alt="Sentient Sims"
      sx={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}

const WHAT_IT_DOES = [
  'Your Sims talk to each other out loud, about their lives, moods and the people around them.',
  'You can talk to them too: type, or just hold a key and speak.',
  'They remember what happened and act on it, so every household tells its own story.',
];

function InitialSetupPage({ setPage }: PageProps) {
  return (
    <WizardStep
      actions={
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setPage(WizardPage.MOD_SETUP);
          }}
        >
          Get Started
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <PlumbobLogo size={96} />
        <Typography variant="h5" sx={{ marginTop: 2 }}>
          Welcome to Sentient Sims!
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1, maxWidth: 460 }}>
          Sentient Sims brings your Sims to life with AI.
        </Typography>
        <List dense sx={{ maxWidth: 460, textAlign: 'left', marginTop: 1 }}>
          {WHAT_IT_DOES.map((line) => (
            <ListItem key={line} disableGutters>
              <ListItemIcon sx={{ minWidth: 26 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText primary={line} slotProps={{ primary: { variant: 'body2' } }} />
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1, maxWidth: 460 }}>
          This takes a couple of minutes: we install the mod, connect an AI, turn on voices and get you into the game.
          If anything ever stops working, run this wizard again from the home screen or Settings.
        </Typography>
      </Box>
    </WizardStep>
  );
}

// Finds the Mods folder on its own and moves on; the picker only appears when
// no folder could be found
function ModSetupPage({ setPage }: PageProps) {
  const versions = useVersions();
  const [state, setState] = useState<'searching' | 'missing'>('searching');

  const refreshVersionsRef = useRef(versions.refresh);
  useEffect(() => {
    refreshVersionsRef.current = versions.refresh;
  });

  const detect = async () => {
    setState('searching');
    try {
      const result = await optionsClient.options.detectModsDirectory();
      await refreshVersionsRef.current();
      if (result.found) {
        setPage(WizardPage.INSTALL_MOD);
        return;
      }
    } catch {
      // Falls through to the picker
    }
    setState('missing');
  };

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void detect();
  });

  return (
    <WizardStep
      title={state === 'searching' ? 'Finding The Sims 4' : 'Where is your Mods folder?'}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.INIT);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            loading={state === 'searching'}
            onClick={() => {
              void detect();
            }}
          >
            Next
          </Button>
        </>
      }
    >
      {state === 'searching' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', marginBottom: 2.5 }}>
            We couldn&apos;t find The Sims 4 on this computer. Click the pencil and pick the folder named
            &quot;Mods&quot; inside your The Sims 4 folder, then press Next. If you&apos;ve never started the game,
            start it once and close it first.
          </Typography>
          <ModsDirectoryComponent />
        </>
      )}
    </WizardStep>
  );
}

type CardPoint =
  | string
  | {
      preLinkText?: string;
      linkUrl: string;
      linkLabel: string;
      postLinkText?: string;
    };

interface CardData {
  header: string;
  page: WizardPage;
  advanced?: boolean;
  recommended?: boolean;
  // A free trial link; the card shows a "Start free trial" button when set
  freeTrialUrl?: string;
  data: {
    header?: string;
    points: CardPoint[];
  }[];
}

const cardData: CardData[] = [
  {
    header: 'Sentient Sims AI',
    page: WizardPage.SENTIENT_SIMS_AI_SETUP,
    recommended: true,
    data: [
      {
        header: 'Cost',
        points: ['Patreon, $5 monthly', 'Unlimited requests'],
      },
      {
        header: 'Features',
        points: ['No API key needed', 'Voices included', 'Uncensored, supports WickedWhims'],
      },
    ],
  },
  {
    header: 'OpenAI',
    page: WizardPage.OPEN_AI_SETUP,
    data: [
      {
        header: 'Cost',
        points: ['Refillable credits', 'Usage based', 'Needs your own OpenAI API key'],
      },
      {
        header: 'Features',
        points: ['Censored', 'WickedWhims unsupported'],
      },
    ],
  },
  {
    header: 'Gemini',
    page: WizardPage.GEMINI_SETUP,
    data: [
      {
        header: 'Cost',
        points: ['Pay-as-you-go', 'Small free tier (20 requests a day)', 'Needs your own Google API key'],
      },
      {
        header: 'Features',
        points: ['Censored', 'WickedWhims unsupported'],
      },
    ],
  },
  {
    header: 'Self Hosted',
    page: WizardPage.SELF_HOSTED_SETUP,
    data: [
      {
        header: 'Cost',
        points: ['Free', 'Requires RTX 3090/4090/5090 GPU', 'Advanced Setup'],
      },
      {
        header: 'Features',
        points: ['Uncensored', 'Supports WickedWhims'],
      },
      {
        header: 'Supported Software',
        points: [
          {
            linkUrl: 'https://github.com/LostRuins/koboldcpp',
            linkLabel: 'koboldcpp',
          },
          {
            preLinkText: '',
            linkUrl: 'https://docs.vllm.ai/en/latest/',
            linkLabel: 'vLLM',
          },
        ],
      },
    ],
  },
];

// Installs the mod on its own once the player is signed in: a progress bar,
// then a green "Mod installed!"
function InstallModPage({ setPage }: PageProps) {
  const versions = useVersions();
  const { newVersionAvailable, busy, checkForUpdates, installUpdate } = useModUpdate();
  const { authStatus } = useAuth();
  const [attempted, setAttempted] = useState(false);

  const modVersionRef = useRef(versions.mod.version);
  useEffect(() => {
    modVersionRef.current = versions.mod.version;
  });

  const install = async () => {
    const available = await checkForUpdates();
    if (available || modVersionRef.current === 'none') {
      await installUpdate();
    }
    setAttempted(true);
  };

  const startedRef = useRef(false);
  useEffect(() => {
    if (authStatus !== 'authenticated' || startedRef.current) {
      return;
    }
    startedRef.current = true;
    void install();
  });

  const installed = versions.mod.version !== 'none' && !newVersionAvailable;

  let body: ReactNode;
  if (authStatus === 'unauthenticated') {
    body = (
      <>
        <Typography variant="body2" align="center" sx={{ marginBottom: 2 }}>
          Sign in or create a free account to download the mod.
        </Typography>
        <LoginComponent />
      </>
    );
  } else if (authStatus !== 'authenticated' || busy || !attempted) {
    body = (
      <Box sx={{ width: '100%', maxWidth: 420, marginX: 'auto', marginTop: 2 }}>
        <Typography variant="body2" align="center" sx={{ marginBottom: 1.5 }}>
          Installing the mod...
        </Typography>
        <LinearProgress />
      </Box>
    );
  } else if (installed) {
    body = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginTop: 2 }}>
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label="Mod installed!"
          color="success"
          sx={{ fontWeight: 600, fontSize: 16, paddingX: 1, height: 40 }}
        />
        <Button
          size="small"
          color="secondary"
          onClick={() => {
            void installUpdate();
          }}
        >
          Reinstall
        </Button>
      </Box>
    );
  } else {
    body = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, marginTop: 2 }}>
        <Typography variant="body2" align="center">
          The mod didn&apos;t install. Make sure The Sims 4 is closed, then try again.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            void install();
          }}
        >
          Try again
        </Button>
      </Box>
    );
  }

  return (
    <WizardStep
      title="Installing the mod"
      description="The app keeps the mod up to date for you from now on."
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.INIT);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() => {
              setPage(WizardPage.ENABLE_MODS);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      {body}
    </WizardStep>
  );
}

function EnableModsPage({ setPage }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [modsEnabled, setModsEnabled] = useState<boolean | null>(null);
  const [scriptModsOn, setScriptModsOn] = useState<boolean | null>(null);
  const [autoFixFailed, setAutoFixFailed] = useState(false);
  const [fileNotFound, setFileNotFound] = useState(false);

  const checkAndFix = async () => {
    setLoading(true);
    setAutoFixFailed(false);
    setFileNotFound(false);

    try {
      const status = await optionsClient.options.getOptionsStatus();
      setModsEnabled(status.modsEnabled);
      setScriptModsOn(status.scriptModsOn);

      if (status.modsEnabled === true && status.scriptModsOn === true) {
        setLoading(false);
        return;
      }

      // Try to auto-fix
      try {
        const fixed = await optionsClient.options.fixOptions();
        setModsEnabled(fixed.modsEnabled);
        setScriptModsOn(fixed.scriptModsOn);
        if (!(fixed.modsEnabled === true && fixed.scriptModsOn === true)) {
          setAutoFixFailed(true);
        }
      } catch {
        setAutoFixFailed(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setFileNotFound(true);
      } else {
        setAutoFixFailed(true);
      }
    }
    setLoading(false);
  };

  const initializedRef = useRef<boolean | null>(null);
  if (initializedRef.current == null) {
    initializedRef.current = true;
    void checkAndFix();
  }

  const allGood = modsEnabled === true && scriptModsOn === true;

  return (
    <WizardStep
      title="Enable Mods"
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.INSTALL_MOD);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            mt: 4,
          }}
        >
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Checking mod settings...</Typography>
        </Box>
      )}

      {!loading && allGood && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Mods and script mods are enabled. You&apos;re all set!
        </Alert>
      )}

      {!loading && !allGood && !fileNotFound && !autoFixFailed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Mod settings need to be updated.
        </Alert>
      )}

      {!loading && autoFixFailed && !fileNotFound && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Unable to automatically enable mods. Please enable them manually:
          </Alert>
          <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Open The Sims 4</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>
                Enable mods by following this guide:{' '}
                <Link
                  href="https://support.curseforge.com/en/support/solutions/articles/9000221442-downloading-and-installing-the-sims-4-mods-pc-manual-guide-"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  sx={{ fontWeight: '500' }}
                >
                  How to enable mods in The Sims 4
                </Link>
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Restart the game after enabling mods</ListItemText>
            </ListItem>
          </List>
        </>
      )}

      {!loading && fileNotFound && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Options.ini not found. You need to launch The Sims 4 at least once to generate the settings file, then
            enable mods:
          </Alert>
          <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Launch The Sims 4 and reach the main menu</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Close the game</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>
                Click the &quot;Re-check&quot; button below, and this step should complete automatically
              </ListItemText>
            </ListItem>
          </List>
        </>
      )}

      {!loading && !allGood && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <Button
            onClick={() => {
              void checkAndFix();
            }}
            color="secondary"
            variant="outlined"
          >
            Re-check
          </Button>
        </Box>
      )}

      {!loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            mt: 3,
          }}
        >
          <Typography variant="body2">
            Mods Enabled:{' '}
            <Typography component="span" variant="body2" color={modsEnabled ? 'success.main' : 'error.main'}>
              {modsEnabled ? 'Yes' : 'No'}
            </Typography>
          </Typography>
          <Typography variant="body2">
            Script Mods Enabled:{' '}
            <Typography component="span" variant="body2" color={scriptModsOn ? 'success.main' : 'error.main'}>
              {scriptModsOn ? 'Yes' : 'No'}
            </Typography>
          </Typography>
        </Box>
      )}
    </WizardStep>
  );
}

// The last step: start the game. Celebrates when the mod connects, then shows
// how to play.
function ConnectModPage({ setPage, finish }: PageProps) {
  const { status } = useWebsocket();

  return (
    <WizardStep
      title={status.mod ? undefined : 'Last step: start playing!'}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color={status.mod ? 'success' : 'primary'}
            onClick={() => {
              finish?.();
            }}
          >
            {status.mod ? "Let's play!" : 'Finish'}
          </Button>
        </>
      }
    >
      {status.mod ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Zoom in style={{ transitionDuration: '600ms' }}>
            <Box
              sx={{
                borderRadius: '50%',
                padding: 1.5,
                boxShadow: (theme) => `0 0 48px ${theme.palette.success.main}88`,
              }}
            >
              <PlumbobLogo size={96} />
            </Box>
          </Zoom>
          <Typography variant="h4" sx={{ marginTop: 2, color: 'success.light', fontWeight: 700 }}>
            You&apos;re connected!
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 0.5, marginBottom: 2 }}>
            Your Sims are awake. Here&apos;s how to play:
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 480, textAlign: 'left' }}>
            <QuickstartList />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <PlumbobLogo size={72} />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Open The Sims 4 and load a household.
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 0.5 }}>
            That&apos;s it! This page lights up when your game connects.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 3, color: 'text.secondary' }}>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="body2">Waiting for the game...</Typography>
          </Box>
        </Box>
      )}
    </WizardStep>
  );
}

// Voices on by default: who speaks (Sentient Sims AI or ElevenLabs) and the
// key the player holds to talk
function VoiceSetupPage({ setPage }: PageProps) {
  const { isMac } = window.electron;
  const aiSettings = useAISettings();
  const { userAttributes } = useAuth();
  const isMember = new PatreonUser(userAttributes).isMember();
  const voiceInput = useSetting<boolean>(SettingsEnum.VOICE_INPUT_ENABLED, true);
  const hotkey = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY, defaultVoiceInputHotkeyFor(isMac));
  const hotkeyMode = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'hold');
  const key = voiceHotkeyLabel(hotkey.value, isMac);
  const usesElevenLabs = aiSettings.ttsApiType === ApiType.ElevenLabs;

  return (
    <WizardStep
      title="Voices"
      description="Your Sims can speak out loud, and you can talk back with your microphone."
      maxWidth={620}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <FormControlLabel
        label={<Typography variant="subtitle1">Your Sims speak out loud</Typography>}
        control={
          <Switch
            checked={aiSettings.ttsEnabled}
            onChange={(change) => void aiSettings.ttsEnabledSetting.setSetting(change.target.checked)}
          />
        }
      />
      {aiSettings.ttsEnabled ? (
        <Box sx={{ paddingLeft: 6, marginBottom: 2 }}>
          <Select
            size="small"
            value={usesElevenLabs ? ApiType.ElevenLabs : ApiType.SentientSimsAI}
            sx={{ minWidth: 300, marginBottom: 1 }}
            onChange={(change) => void aiSettings.ttsApiTypeSetting.setSetting(ApiTypeFromValue(change.target.value))}
          >
            <MenuItem value={ApiType.SentientSimsAI}>Sentient Sims AI voices (Patreon)</MenuItem>
            <MenuItem value={ApiType.ElevenLabs}>ElevenLabs (your own key)</MenuItem>
          </Select>
          {usesElevenLabs ? <ElevenLabsKeySetup /> : null}
          {!usesElevenLabs && isMember ? (
            <Typography variant="body2" sx={{ color: 'success.main' }}>
              Voices come with your Patreon membership. Nothing else to set up.
            </Typography>
          ) : null}
          {!usesElevenLabs && !isMember ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Sentient Sims AI voices come with a Patreon membership. Without one, your Sims&apos; words show as
              subtitles.
            </Typography>
          ) : null}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', paddingLeft: 6, marginBottom: 2 }}>
          Your Sims&apos; words show as subtitles only. You can turn voices on any time in Settings, Voice.
        </Typography>
      )}
      <FormControlLabel
        label={<Typography variant="subtitle1">Talk to your Sims with your microphone</Typography>}
        control={
          <Switch checked={voiceInput.value} onChange={(change) => void voiceInput.setSetting(change.target.checked)} />
        }
      />
      {voiceInput.value ? (
        <Box sx={{ paddingLeft: 6 }}>
          <VoiceHotkeyRow />
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            {hotkeyMode.value === 'toggle'
              ? `In the game, press ${key} to start talking and press it again when you're done.`
              : `In the game, hold ${key} while you talk and let go when you're done.`}
          </Typography>
        </Box>
      ) : null}
    </WizardStep>
  );
}

function AIProviderPage({ setPage }: PageProps) {
  return (
    <WizardStep
      title="Choose your AI"
      description="The AI writes everything your Sims say and do. Not sure what an API key is? Pick Sentient Sims AI: join on Patreon and it just works, voices included. The other choices use your own API key from another company and take a few more steps. You can change this later in Settings."
      maxWidth={880}
      actions={
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setPage(WizardPage.ENABLE_MODS);
          }}
        >
          Back
        </Button>
      }
    >
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {cardData.map((card) => (
          <Grid key={card.header} size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                'height': '100%',
                'display': 'flex',
                'flexDirection': 'column',
                'cursor': 'pointer',
                'transition': 'border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => `0 4px 24px ${theme.palette.primary.main}2e`,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => {
                setPage(card.page);
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography variant="h6" component="div">
                    {card.header}
                  </Typography>
                  {card.recommended ? (
                    <Chip
                      label="Recommended"
                      size="small"
                      sx={{
                        backgroundColor: (theme) => `${theme.palette.primary.main}29`,
                        color: 'primary.light',
                        fontWeight: 600,
                      }}
                    />
                  ) : null}
                </Box>
                {card.freeTrialUrl ? (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    href={card.freeTrialUrl}
                    target="_blank"
                    sx={{ marginBottom: 1 }}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    Start free trial
                  </Button>
                ) : null}
                {card.data.map((section) => (
                  <Fragment key={section.header ?? card.header}>
                    {section.header && (
                      <Typography
                        variant="overline"
                        sx={{ color: 'text.secondary', letterSpacing: '0.08em', lineHeight: 2 }}
                      >
                        {section.header}
                      </Typography>
                    )}

                    <List dense disablePadding sx={{ marginBottom: 1 }}>
                      {section.points.map((point) => (
                        <ListItem
                          key={typeof point === 'string' ? point : point.linkLabel}
                          disablePadding
                          disableGutters
                        >
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <FiberManualRecordIcon
                              sx={{
                                fontSize: '0.4rem',
                                color: 'primary.light',
                              }}
                            />
                          </ListItemIcon>
                          {typeof point === 'string' ? (
                            <ListItemText primary={point} slotProps={{ primary: { variant: 'body2' } }} />
                          ) : (
                            <ListItemText slotProps={{ primary: { variant: 'body2' } }}>
                              {point.preLinkText}
                              <Link
                                href={point.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                                sx={{ fontWeight: '500' }}
                              >
                                {point.linkLabel}
                              </Link>
                              {point.postLinkText}
                            </ListItemText>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </WizardStep>
  );
}

function SentientSimsAISetupPage({ setPage }: PageProps) {
  const { aiStatus, aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const { userAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);

  useEffect(() => {
    void setAiApiType(ApiType.SentientSimsAI);
  }, [setAiApiType]);

  const isLoggedIn = !!userAttributes;
  const isPatreonLinked = !!userAttributes && patreonUser.isPatreonLinked();
  const isSubscriber = !!userAttributes && patreonUser.isPatreonLinked() && patreonUser.isSubscriber();

  // Join, sign in, connect: the first step not done yet is the active one
  const steps = [isSubscriber, isLoggedIn, isPatreonLinked];
  const firstOpen = steps.findIndex((done) => !done);
  const activeStep = firstOpen === -1 ? steps.length : firstOpen;

  const joinPatreon = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 2 }}>
      <Typography variant="body2" align="center">
        Step 1: join Sentient Sims on Patreon ($5 a month). Already a member? Go on to step 2.
      </Typography>
      <PatreonButton url={patreonMembershipUrl} />
    </Box>
  );

  return (
    <WizardStep
      title="Sentient Sims AI"
      maxWidth={720}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            loading={aiStatus.loading}
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            loading={aiStatus.loading}
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <Stepper activeStep={activeStep} sx={{ marginBottom: 3 }}>
        <Step key="subscribe-patreon" completed={isSubscriber}>
          <StepLabel>
            <Typography variant="body2" color={isSubscriber ? 'success.main' : undefined}>
              {isSubscriber ? 'Patreon member' : 'Join on Patreon'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="login" completed={isLoggedIn}>
          <StepLabel>
            <Typography variant="body2" color={isLoggedIn ? 'success.main' : undefined}>
              {isLoggedIn ? 'Signed in' : 'Sign in'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="link-patreon" completed={isPatreonLinked}>
          <StepLabel>
            <Typography variant="body2" color={isPatreonLinked ? 'success.main' : undefined}>
              {isPatreonLinked ? 'Patreon connected' : 'Connect Patreon'}
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>
      {!isLoggedIn && (
        <>
          {joinPatreon}
          <Typography variant="body2" align="center" sx={{ marginBottom: 2 }}>
            Step 2: sign in, or create a free account.
          </Typography>
          <LoginComponent />
        </>
      )}
      {isLoggedIn && !isPatreonLinked && (
        <>
          {joinPatreon}
          <Typography variant="body2" align="center">
            Step 2: connect the Patreon account you joined with.
          </Typography>
          <PatreonLinkingComponent />
        </>
      )}
      {isPatreonLinked && !isSubscriber && <PatreonSubscribingComponent />}
      {isSubscriber && (
        <Box
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            gap: 1,
            paddingY: 6,
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
          <Typography variant="body1">All set! Your Patreon membership is connected.</Typography>
        </Box>
      )}
    </WizardStep>
  );
}

function OpenAISetupPage({ setPage }: PageProps) {
  const { testAI, aiStatus, aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;

  useEffect(() => {
    void setAiApiType(ApiType.OpenAI);
  }, [setAiApiType]);

  return (
    <WizardStep
      title="OpenAI Setup"
      description="Create an OpenAI platform account and generate an API key. The key lets the app use the pay-as-you-go API version of ChatGPT."
      maxWidth={640}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            loading={aiStatus.loading}
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            loading={aiStatus.loading}
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>
            Create an OpenAI Platform account here{' '}
            <Link
              href="https://platform.openai.com/signup?launch"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{ fontWeight: '500' }}
            >
              https://platform.openai.com/signup?launch
            </Link>
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>
            Add $3 to $5 in credits to your OpenAI account{' '}
            <Link
              href="https://platform.openai.com/settings/organization/billing/overview"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{ fontWeight: '500' }}
            >
              https://platform.openai.com/settings/organization/billing/overview
            </Link>
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>
            Create a new API key{' '}
            <Link
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{ fontWeight: '500' }}
            >
              https://platform.openai.com/api-keys
            </Link>
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Click create new secret key" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Name the key sentient sims" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Click Create secret key" />
        </ListItem>
        <ListItem sx={{ display: 'list-item', mb: 2 }}>
          <ListItemText primary="Click Copy to copy the API key, then paste it in the box here:" />
        </ListItem>
        <ProviderConnectionPanel apiType={ApiType.OpenAI} hideEndpoint />
      </List>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 1,
          marginTop: 1,
        }}
      >
        <AIStatusComponent />
        <Button
          loading={aiStatus.loading}
          onClick={() => {
            void testAI();
          }}
          color="primary"
          variant="outlined"
        >
          Test
        </Button>
      </Box>
    </WizardStep>
  );
}

function GeminiSetupPage({ setPage }: PageProps) {
  const { testAI, aiStatus, aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;

  useEffect(() => {
    void setAiApiType(ApiType.Gemini);
  }, [setAiApiType]);

  return (
    <WizardStep
      title="Gemini AI Setup"
      description="Create a Google AI Studio API key to use Gemini."
      maxWidth={640}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>
            Open Google AI Studio here{' '}
            <Link
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{ fontWeight: '500' }}
            >
              https://aistudio.google.com/apikey
            </Link>
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Click Create API key" />
        </ListItem>
        <ListItem sx={{ display: 'list-item', mb: 2 }}>
          <ListItemText primary="Copy the API key, then paste it in the box here:" />
        </ListItem>
        <ProviderConnectionPanel apiType={ApiType.Gemini} hideEndpoint />
      </List>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 1,
          marginTop: 1,
        }}
      >
        <AIStatusComponent />
        <Button
          loading={aiStatus.loading}
          onClick={() => {
            void testAI();
          }}
          color="primary"
          variant="outlined"
        >
          Test
        </Button>
      </Box>
    </WizardStep>
  );
}

function SelfHostedSetupPage({ setPage }: PageProps) {
  const { testAI, aiStatus, aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const selected = ApiTypeFromValue(aiApiTypeSetting.value);
  const selfHostedType = selected === ApiType.VLLM ? ApiType.VLLM : ApiType.KoboldAI;

  // Visiting this page selects a self hosted provider, mirroring how the
  // other provider setup pages select theirs on mount
  useEffect(() => {
    if (selected !== ApiType.KoboldAI && selected !== ApiType.VLLM) {
      void setAiApiType(ApiType.KoboldAI);
    }
  }, [setAiApiType, selected]);

  return (
    <WizardStep
      title="Self Hosted Setup"
      description={
        <>
          Run an AI server on your own GPU with{' '}
          <Link
            href="https://github.com/LostRuins/koboldcpp"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            sx={{ fontWeight: '500' }}
          >
            koboldcpp
          </Link>{' '}
          or{' '}
          <Link
            href="https://docs.vllm.ai/en/latest/"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            sx={{ fontWeight: '500' }}
          >
            vLLM
          </Link>
          , then point the app at its endpoint.
        </>
      }
      maxWidth={640}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPage(WizardPage.VOICE_SETUP);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <Select
        size="small"
        fullWidth
        value={selfHostedType}
        sx={{ marginBottom: 2 }}
        onChange={(change) => {
          void aiApiTypeSetting.setSetting(ApiTypeFromValue(change.target.value));
        }}
      >
        <MenuItem value={ApiType.KoboldAI}>Kobold AI (koboldcpp)</MenuItem>
        <MenuItem value={ApiType.VLLM}>VLLM</MenuItem>
      </Select>
      <ProviderConnectionPanel apiType={selfHostedType} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 1,
          marginTop: 1,
        }}
      >
        <AIStatusComponent />
        <Button
          loading={aiStatus.loading}
          onClick={() => {
            void testAI();
          }}
          color="primary"
          variant="outlined"
        >
          Test
        </Button>
      </Box>
    </WizardStep>
  );
}

export function SetupWizardModal({ open, setOpen }: SetupWizardModalParameters) {
  const currentWizardPage = useSetting<WizardPage>(SettingsEnum.SETUP_WIZARD_PAGE, WizardPage.INIT);
  const setupComplete = useSetting<boolean>(SettingsEnum.SETUP_COMPLETE, false);
  const voicesOffNudgeShown = useSetting<boolean>(SettingsEnum.VOICES_OFF_NUDGE_SHOWN, false);
  const setPage = (wizardPage: WizardPage) => {
    void currentWizardPage.setSetting(wizardPage);
  };

  // A sign-in or Patreon link reloads the window; the wizard comes back where it was
  useEffect(() => {
    if (
      !open &&
      (currentWizardPage.value === WizardPage.SENTIENT_SIMS_AI_SETUP ||
        currentWizardPage.value === WizardPage.INSTALL_MOD)
    ) {
      setOpen(true);
    }
  }, [currentWizardPage.value, open, setOpen]);

  const close = () => {
    setPage(WizardPage.INIT);
    setOpen(false);
  };

  const finish = () => {
    void setupComplete.setSetting(true);
    void voicesOffNudgeShown.setSetting(false);
    close();
  };

  return (
    <Modal open={open} onClose={close}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(960px, 94vw)',
          height: 'min(720px, 92vh)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3.5,
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, marginBottom: 1 }}>
          <PlumbobLogo size={30} />
          <Typography variant="h6">Setup Wizard</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small" onClick={close} aria-label="Close setup wizard">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {currentWizardPage.value === WizardPage.INIT && <InitialSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.MOD_SETUP && <ModSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.AI_PROVIDER_SETUP && <AIProviderPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.SENTIENT_SIMS_AI_SETUP && <SentientSimsAISetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.OPEN_AI_SETUP && <OpenAISetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.GEMINI_SETUP && <GeminiSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.SELF_HOSTED_SETUP && <SelfHostedSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.VOICE_SETUP && <VoiceSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.CONNECT_MOD && <ConnectModPage setPage={setPage} finish={finish} />}
        {currentWizardPage.value === WizardPage.INSTALL_MOD && <InstallModPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.ENABLE_MODS && <EnableModsPage setPage={setPage} />}
      </Box>
    </Modal>
  );
}
