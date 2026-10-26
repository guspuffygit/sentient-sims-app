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
  Stack,
} from '@mui/material';
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { ModsDirectoryComponent } from 'renderer/ModsDirectoryComponent';
import { useVersions } from 'renderer/providers/VersionsProvider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from '@mui/icons-material/Close';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import { ProviderConnectionPanel } from 'renderer/settings/ProviderConnectionPanel';
import ApiKeyAIComponent from 'renderer/ApiKeyAIComponent';
import { useWebsocket } from 'renderer/providers/WebsocketProvider';
import useSetting from 'renderer/hooks/useSetting';
import { WizardPage } from 'main/sentient-sims/models/WizardPage';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import { ModInstallOutcome, useModUpdate } from 'renderer/providers/ModUpdateProvider';
import { appApiUrl, defaultVoiceInputHotkeyFor, patreonMembershipUrl } from 'main/sentient-sims/constants';
import { voiceHotkeyLabel } from 'main/sentient-sims/models/VoiceHotkeyPresets';
import { ElevenLabsKeySetup } from 'renderer/settings/voice/ElevenLabsKeySetup';
import { AboutYouFields, MicrophoneSetup, VoiceHotkeyRow } from 'renderer/settings/voice/VoiceInputSettingsComponent';
import { getPatreonOauthUrl, PatreonActionButton } from 'renderer/PatreonComponent';
import { LoginComponent } from './LoginComponent';
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
  'They remember what happened, so every household tells its own story.',
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
          Get Started!
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
        <Typography
          variant="h6"
          sx={{
            marginTop: 2,
            maxWidth: 480,
            fontWeight: 800,
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            background: (theme) =>
              `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.primary.light}, #f78fb3)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Setup takes just a few minutes. We&apos;ll install the mod and connect their AI &quot;brain&quot;, so you can
          start playing!
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

interface CardData {
  header: string;
  page: WizardPage;
  recommended?: boolean;
  // A free trial link; the card shows a "Start free trial" button when set
  freeTrialUrl?: string;
  points: string[];
}

// The options shown under the Patreon card, for players not subscribing
const cardData: CardData[] = [
  {
    header: 'OpenAI',
    page: WizardPage.OPEN_AI_SETUP,
    points: [
      'Refillable credits',
      'Usage based',
      'Needs your own OpenAI API key',
      'Censored',
      'WickedWhims unsupported',
    ],
  },
  {
    header: 'Gemini',
    page: WizardPage.GEMINI_SETUP,
    points: [
      'Pay-as-you-go',
      'Small free tier (20 requests a day)',
      'Needs your own Google API key',
      'Censored',
      'WickedWhims unsupported',
    ],
  },
  {
    header: 'Self Hosted',
    page: WizardPage.SELF_HOSTED_SETUP,
    points: ['Free', 'Requires RTX 3090/4090/5090 GPU', 'Advanced setup', 'Uncensored', 'Supports WickedWhims'],
  },
];

// What the account is for, above every sign-in form in the wizard
function AccountNote() {
  return (
    <Box sx={{ textAlign: 'center', marginBottom: 1.5 }}>
      <Typography variant="body2">
        Create your free Sentient Sims account. It&apos;s what downloads and updates the mod.
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Subscribed on Patreon? You&apos;ll link Patreon in a later step. This account is just for your Sentient Sims
        mod.
      </Typography>
    </Box>
  );
}

// Installs the mod on its own once the player is signed in: a progress bar,
// then a green "Mod installed!"
function InstallModPage({ setPage }: PageProps) {
  const versions = useVersions();
  const { newVersionAvailable, busy, checkForUpdates, installUpdate } = useModUpdate();
  const { authStatus } = useAuth();
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<ModInstallOutcome>();

  const modVersionRef = useRef(versions.mod.version);
  const refreshVersionsRef = useRef(versions.refresh);
  useEffect(() => {
    modVersionRef.current = versions.mod.version;
    refreshVersionsRef.current = versions.refresh;
  });

  const install = async () => {
    setAttempted(false);
    setOutcome(undefined);
    const available = await checkForUpdates();
    if (available || modVersionRef.current === 'none') {
      setOutcome(await installUpdate());
    }
    await refreshVersionsRef.current();
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
      <Box sx={{ width: '100%', maxWidth: 460, marginX: 'auto' }}>
        <AccountNote />
        <LoginComponent initialState="signUp" />
      </Box>
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
    const gameOpen =
      (outcome && 'skipped' in outcome && outcome.skipped === 'game-running') ||
      (outcome && 'error' in outcome && outcome.error.includes('Close The Sims 4'));
    let reason = "The mod didn't install. Please try again.";
    if (gameOpen) {
      reason = 'The Sims 4 is open. Close the game, then try again.';
    } else if (outcome && 'error' in outcome) {
      reason = `The mod didn't install: ${outcome.error}`;
    }
    body = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, marginTop: 2 }}>
        <Typography variant="body2" align="center">
          {reason}
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
      title={authStatus === 'unauthenticated' ? 'Your Sentient Sims account' : 'Installing the mod'}
      description={
        authStatus === 'unauthenticated' ? undefined : 'The app keeps the mod up to date for you from now on.'
      }
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
            disabled={busy || !installed}
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

// How long a game that was open before this page may take to connect before
// the page asks for a restart, and how long a game opened from here may take
const OPEN_BEFORE_GRACE_MS = 15000;
const OPENED_HERE_GRACE_MS = 180000;

// Asks the app every few seconds whether The Sims 4 is running, while waiting
// for the mod. True once the game has been open long enough without connecting
// that it needs a restart: it was open before the mod was installed or before
// mods were switched on, and a running game never loads a new mod
function useGameNeedsRestart(connected: boolean) {
  const [needsRestart, setNeedsRestart] = useState(false);
  const firstSeenRef = useRef<{ at: number; openBefore: boolean } | undefined>(undefined);
  const polledRef = useRef(false);

  useEffect(() => {
    if (connected) {
      return undefined;
    }
    let cancelled = false;
    const poll = async () => {
      let running = false;
      try {
        const response = await fetch(`${appApiUrl}/update/game-running`);
        running = ((await response.json()) as { running?: boolean }).running === true;
      } catch {
        // An unanswered check reads as not running
      }
      if (cancelled) {
        return;
      }
      const firstPoll = !polledRef.current;
      polledRef.current = true;
      if (!running) {
        firstSeenRef.current = undefined;
        setNeedsRestart(false);
        return;
      }
      firstSeenRef.current ??= { at: Date.now(), openBefore: firstPoll };
      const grace = firstSeenRef.current.openBefore ? OPEN_BEFORE_GRACE_MS : OPENED_HERE_GRACE_MS;
      setNeedsRestart(Date.now() - firstSeenRef.current.at >= grace);
    };
    void poll();
    const intervalId = setInterval(() => {
      void poll();
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [connected]);

  return needsRestart && !connected;
}

// The last step: start the game. Celebrates when the mod connects, then shows
// how to play. Finish waits for the game; "I'll do this later" leaves without it
function ConnectModPage({ setPage, finish }: PageProps) {
  const { status } = useWebsocket();
  const needsRestart = useGameNeedsRestart(status.mod);

  return (
    <WizardStep
      title={status.mod ? undefined : 'Last step: start playing!'}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.ABOUT_YOU);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color={status.mod ? 'success' : 'primary'}
            disabled={!status.mod}
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
          {needsRestart ? (
            <Alert severity="info" sx={{ marginTop: 3, textAlign: 'left' }}>
              The Sims 4 is open but the mod hasn&apos;t connected yet. A game that was already open before setup
              can&apos;t load the mod: close The Sims 4 and open it again to finish.
            </Alert>
          ) : null}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 3, color: 'text.secondary' }}>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="body2">Waiting for the game...</Typography>
          </Box>
          <Link
            component="button"
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 3 }}
            onClick={() => {
              finish?.();
            }}
          >
            I&apos;ll do this later
          </Link>
        </Box>
      )}
    </WizardStep>
  );
}

// Speech to text for each AI: the player's microphone uses the provider they just set up
const TRANSCRIPTION_FOR_AI: Partial<Record<ApiType, ApiType>> = {
  [ApiType.SentientSimsAI]: ApiType.SentientSimsAI,
  [ApiType.OpenAI]: ApiType.OpenAI,
  [ApiType.Gemini]: ApiType.Gemini,
  [ApiType.OpenRouter]: ApiType.OpenRouter,
};

// Voices: a Patreon member gets Sentient Sims AI voices with nothing to set up; anyone
// else starts with voices off and can turn them on with their own ElevenLabs key
function VoiceSetupPage({ setPage }: PageProps) {
  const aiSettings = useAISettings();
  const { userAttributes, authStatus, loading: authLoading } = useAuth();
  const isMember = new PatreonUser(userAttributes).isMember();
  const usesElevenLabs = aiSettings.ttsApiType === ApiType.ElevenLabs;
  const [elevenLabsKeyWorks, setElevenLabsKeyWorks] = useState(false);
  const needsElevenLabsKey = aiSettings.ttsEnabled && usesElevenLabs && !elevenLabsKeyWorks;

  // Waits for the membership and settings to load, then sets the page up once
  const membershipKnown = authStatus === 'unauthenticated' || (!!userAttributes && !authLoading);
  const settingsLoaded = !aiSettings.aiApiTypeSetting.isLoading && !aiSettings.ttsApiTypeSetting.isLoading;
  const preparedRef = useRef(false);
  useEffect(() => {
    if (preparedRef.current || !membershipKnown || !settingsLoaded) {
      return;
    }
    preparedRef.current = true;
    if (!isMember && !usesElevenLabs) {
      void aiSettings.ttsEnabledSetting.setSetting(false);
    }
  });

  const setVoices = (on: boolean) => {
    if (on && !isMember) {
      void aiSettings.ttsApiTypeSetting.setSetting(ApiType.ElevenLabs);
    }
    void aiSettings.ttsEnabledSetting.setSetting(on);
  };

  let voiceDetails: ReactNode;
  if (!aiSettings.ttsEnabled) {
    voiceDetails = (
      <Typography variant="body2" sx={{ color: 'text.secondary', paddingLeft: 6, marginBottom: 2 }}>
        {isMember
          ? "Your Sims' words show as subtitles only. You can turn voices on any time in Settings, Voice."
          : "Your Sims' words show as subtitles. Want to hear them? Sentient Sims AI voices come with a Patreon membership, or turn this on to use your own ElevenLabs key."}
      </Typography>
    );
  } else if (isMember) {
    voiceDetails = (
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
        {usesElevenLabs ? (
          <ElevenLabsKeySetup autoCheck onCheckedChange={setElevenLabsKeyWorks} />
        ) : (
          <Typography variant="body2" sx={{ color: 'success.main' }}>
            Voices come with your Patreon membership.
          </Typography>
        )}
      </Box>
    );
  } else {
    voiceDetails = (
      <Box sx={{ paddingLeft: 6, marginBottom: 2 }}>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          Voices use your own ElevenLabs key. (Sentient Sims AI voices come with a Patreon membership.)
        </Typography>
        <ElevenLabsKeySetup autoCheck onCheckedChange={setElevenLabsKeyWorks} />
      </Box>
    );
  }

  return (
    <WizardStep
      title="Voices"
      description="Your Sims can speak out loud."
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
            disabled={needsElevenLabsKey}
            onClick={() => {
              setPage(WizardPage.MICROPHONE_SETUP);
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
            onChange={(change) => {
              setVoices(change.target.checked);
            }}
          />
        }
      />
      {voiceDetails}
      {needsElevenLabsKey ? (
        <Typography variant="caption" component="p" align="center" sx={{ color: 'text.secondary' }}>
          Next unlocks once your ElevenLabs key works. Turn voices off to skip this.
        </Typography>
      ) : null}
    </WizardStep>
  );
}

// The microphone: switched on, a picker with a live level and a test that turns
// three seconds of speech into text, and the talk key. Voice input follows the
// AI set up earlier; with none that can transcribe, it stays off
function MicrophoneSetupPage({ setPage }: PageProps) {
  const { isMac } = window.electron;
  const aiSettings = useAISettings();
  const voiceInput = useSetting<boolean>(SettingsEnum.VOICE_INPUT_ENABLED, true);
  const voiceInputProvider = useSetting<string>(SettingsEnum.VOICE_INPUT_PROVIDER, ApiType.SentientSimsAI);
  const hotkey = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY, defaultVoiceInputHotkeyFor(isMac));
  const hotkeyMode = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'hold');
  const key = voiceHotkeyLabel(hotkey.value, isMac);
  const transcription = TRANSCRIPTION_FOR_AI[aiSettings.aiApiType];

  // Waits for the settings to load, then points transcription at the AI once
  const settingsLoaded = !aiSettings.aiApiTypeSetting.isLoading && !voiceInput.isLoading;
  const preparedRef = useRef(false);
  useEffect(() => {
    if (preparedRef.current || !settingsLoaded) {
      return;
    }
    preparedRef.current = true;
    if (transcription) {
      void voiceInputProvider.setSetting(transcription);
    } else {
      void voiceInput.setSetting(false);
    }
  });

  return (
    <WizardStep
      title="Your microphone"
      description="Talk to your Sims out loud: hold a key in the game and speak."
      maxWidth={620}
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
            onClick={() => {
              setPage(WizardPage.ABOUT_YOU);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <FormControlLabel
        label={<Typography variant="subtitle1">Talk to your Sims with your microphone</Typography>}
        control={
          <Switch
            checked={voiceInput.value}
            disabled={!transcription}
            onChange={(change) => void voiceInput.setSetting(change.target.checked)}
          />
        }
      />
      {voiceInput.value ? (
        <Stack spacing={2} sx={{ paddingLeft: 6, marginTop: 1 }}>
          <MicrophoneSetup showLevel />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Speak and watch the level move. Press Test and say a few words to see them turned into text by{' '}
            {transcription ? ApiTypeName(transcription) : 'your AI'}.
          </Typography>
          <VoiceHotkeyRow />
          <Typography variant="body2">
            {hotkeyMode.value === 'toggle'
              ? `In the game, press ${key} to start talking and press it again when you're done.`
              : `In the game, hold ${key} while you talk and let go when you're done.`}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', paddingLeft: 6 }}>
          {transcription
            ? 'You can type to your Sims instead, or turn this on any time in Settings, Voice.'
            : 'Talking needs Sentient Sims AI, OpenAI or Gemini to turn your voice into text. You can set one up later in Settings, Voice, and type to your Sims until then.'}
        </Typography>
      )}
    </WizardStep>
  );
}

// Who the player is to their Sims, so they know how to address them. Optional
function AboutYouPage({ setPage }: PageProps) {
  const next = () => {
    setPage(WizardPage.CONNECT_MOD);
  };

  return (
    <WizardStep
      title="About you"
      description="Tell your Sims who you are, so they know how to talk to you. This is optional, and you can change it any time in Settings, Voice."
      maxWidth={620}
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.MICROPHONE_SETUP);
            }}
          >
            Back
          </Button>
          <Button color="secondary" onClick={next}>
            Skip
          </Button>
          <Button variant="contained" onClick={next}>
            Next
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <AboutYouFields />
      </Stack>
    </WizardStep>
  );
}

const PATREON_PERKS = [
  'Premium, fast Sentient Sims AI',
  'Uncensored, WickedWhims supported',
  'Unlimited use, no API keys or usage bills',
  'Voices included',
  'The easiest setup: subscribe, connect, play',
];

// The eye-catching Sentient Sims AI offer at the top of "Choose your AI"
function PatreonPlug({ onSelect }: { onSelect: () => void }) {
  return (
    <Card
      onClick={onSelect}
      sx={{
        'cursor': 'pointer',
        'border': '1.5px solid',
        'borderColor': 'primary.main',
        'background': (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}2e, ${theme.palette.success.main}1f 60%, transparent)`,
        'boxShadow': (theme) => `0 6px 32px ${theme.palette.primary.main}33`,
        'transition': 'box-shadow 120ms ease, transform 120ms ease',
        '&:hover': {
          boxShadow: (theme) => `0 8px 40px ${theme.palette.primary.main}55`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent
        sx={{
          'display': 'flex',
          'flexWrap': 'wrap',
          'alignItems': 'center',
          'gap': 3,
          'padding': 2.5,
          '&:last-child': { paddingBottom: 2.5 },
        }}
      >
        <Box sx={{ flex: '1 1 420px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
            <PlumbobLogo size={28} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              Sentient Sims AI
            </Typography>
            <Chip
              label="Recommended"
              size="small"
              sx={{
                backgroundColor: (theme) => `${theme.palette.success.main}33`,
                color: 'success.light',
                fontWeight: 600,
              }}
            />
          </Box>
          <List
            dense
            disablePadding
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: 2 }}
          >
            {PATREON_PERKS.map((perk) => (
              <ListItem key={perk} disablePadding disableGutters>
                <ListItemIcon sx={{ minWidth: 26 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText primary={perk} slotProps={{ primary: { variant: 'body2' } }} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
            $5
            <Typography component="span" variant="body1" sx={{ color: 'text.secondary', marginLeft: 0.5 }}>
              /month
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            on Patreon
          </Typography>
          <Button variant="contained" size="large">
            Set up Sentient Sims AI
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function AIProviderPage({ setPage }: PageProps) {
  return (
    <WizardStep
      title="Choose your AI"
      description="The Sentient Sims mod itself is free, and always will be! You can choose which AI model it connects with in order to make your Sims come alive."
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
      <PatreonPlug
        onSelect={() => {
          setPage(WizardPage.SENTIENT_SIMS_AI_SETUP);
        }}
      />
      <Typography variant="subtitle1" align="center" sx={{ marginTop: 2.5, fontWeight: 600 }}>
        Not ready to subscribe? Here are some other options
      </Typography>
      <Typography variant="body2" align="center" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        These use your own API key from another company and take a few more steps. You can change this later in
        Settings.
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {cardData.map((card) => (
          <Grid key={card.header} size={{ xs: 12, sm: 4 }}>
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
                <List dense disablePadding>
                  {card.points.map((point) => (
                    <ListItem key={point} disablePadding disableGutters>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <FiberManualRecordIcon
                          sx={{
                            fontSize: '0.4rem',
                            color: 'primary.light',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={point} slotProps={{ primary: { variant: 'body2' } }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </WizardStep>
  );
}

function SentientSimsAISetupPage({ setPage }: PageProps) {
  const { aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const { userAttributes, refreshUserAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    void setAiApiType(ApiType.SentientSimsAI);
  }, [setAiApiType]);

  const isLoggedIn = !!userAttributes;
  const isPatreonLinked = isLoggedIn && patreonUser.isPatreonLinked();
  const isMember = isLoggedIn && patreonUser.isMember();

  // A subscription made in the browser reaches the account on the server's next
  // look at Patreon, so a linked non-member is checked again until it shows
  useEffect(() => {
    if (!isPatreonLinked || isMember) {
      return undefined;
    }
    const intervalId = setInterval(() => {
      void refreshUserAttributes();
    }, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [isPatreonLinked, isMember, refreshUserAttributes]);

  // Sign in, subscribe, connect: the first step not done yet is the active one
  const steps = [isLoggedIn, isMember, isPatreonLinked];
  const firstOpen = steps.findIndex((done) => !done);
  const activeStep = firstOpen === -1 ? steps.length : firstOpen;

  const connectButton = (label: string, variant: 'contained' | 'outlined' = 'contained') => (
    <PatreonActionButton
      url={getPatreonOauthUrl()}
      label={label}
      variant={variant}
      onClick={() => {
        setConnecting(true);
      }}
    />
  );

  const connectingNote = connecting ? (
    <Typography variant="body2" align="center" sx={{ color: 'text.secondary', marginTop: 1 }}>
      A browser window opened. Finish there and this page updates by itself.
    </Typography>
  ) : null;

  let body: ReactNode;
  if (!isLoggedIn) {
    body = (
      <Box sx={{ width: '100%', maxWidth: 460, marginX: 'auto' }}>
        <AccountNote />
        <LoginComponent initialState="signUp" />
      </Box>
    );
  } else if (!isPatreonLinked) {
    body = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Step 1: Subscribe on Patreon
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
              $5 a month. Already subscribed? Skip to step 2.
            </Typography>
            <PatreonActionButton url={patreonMembershipUrl} label="Subscribe on Patreon" variant="outlined" />
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Step 2: Link your Patreon account
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
              Sign in on Patreon with the account you subscribed with, then press Allow.
            </Typography>
            {connectButton('Link my Patreon account')}
            {connectingNote}
          </CardContent>
        </Card>
      </Box>
    );
  } else if (!isMember) {
    body = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Alert severity="warning" sx={{ width: '100%' }}>
          A Patreon account is linked, but it has no Sentient Sims membership yet. Just subscribed? It can take a minute
          to show, and this page checks again by itself.
        </Alert>
        <PatreonActionButton url={patreonMembershipUrl} label="Subscribe on Patreon" />
        <Typography variant="body2" align="center" sx={{ color: 'text.secondary', maxWidth: 520 }}>
          Linked the wrong Patreon account? Your browser may have signed you in as someone else. Sign out on
          patreon.com, then link again with the account you subscribed with.
        </Typography>
        {connectButton('Link a different Patreon account', 'outlined')}
        {connectingNote}
      </Box>
    );
  } else {
    body = (
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
    );
  }

  return (
    <WizardStep
      title="Sentient Sims AI"
      maxWidth={720}
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
            disabled={!isMember}
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
        <Step key="login" completed={isLoggedIn}>
          <StepLabel>
            <Typography variant="body2" color={isLoggedIn ? 'success.main' : undefined}>
              {isLoggedIn ? 'Signed in' : 'Sign in'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="subscribe-patreon" completed={isMember}>
          <StepLabel>
            <Typography variant="body2" color={isMember ? 'success.main' : undefined}>
              {isMember ? 'Patreon member' : 'Subscribe on Patreon'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="link-patreon" completed={isPatreonLinked}>
          <StepLabel>
            <Typography variant="body2" color={isPatreonLinked ? 'success.main' : undefined}>
              {isPatreonLinked ? 'Patreon linked' : 'Link Patreon'}
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>
      {body}
      {isLoggedIn && !isMember ? (
        <Typography variant="caption" component="p" align="center" sx={{ color: 'text.secondary', marginTop: 2 }}>
          You can continue once your account is linked.
        </Typography>
      ) : null}
    </WizardStep>
  );
}

type KeyCheck = { state: 'idle' | 'testing' | 'ok' | 'failed'; message?: string };

// The wizard's own connection test for one provider: refuses an empty key, waits
// for the typed key to be saved (settings save 600 ms after the last keystroke),
// then tests THAT provider, not whichever one the app was set to before. A result
// counts only for the key it tested, so editing the key locks Next again
function useKeyCheck(apiType: ApiType, key: string | undefined) {
  const signature = `${apiType}:${key?.trim() ?? ''}`;
  const [result, setResult] = useState<{ signature: string; check: KeyCheck }>();
  const testedRef = useRef<string | undefined>(undefined);
  const seqRef = useRef(0);

  const run = async (force = false) => {
    if (key !== undefined && !key.trim()) {
      testedRef.current = undefined;
      setResult({ signature, check: { state: 'failed', message: 'Paste your key first.' } });
      return;
    }
    if (!force && testedRef.current === signature) {
      return;
    }
    testedRef.current = signature;
    seqRef.current += 1;
    const seq = seqRef.current;
    setResult({ signature, check: { state: 'testing' } });
    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });
    let check: KeyCheck;
    try {
      const params = new URLSearchParams({ apiType });
      const response = await fetch(`${appApiUrl}/debug/test-ai?${params.toString()}`);
      const body = (await response.json()) as { status?: string; error?: string };
      if (response.ok && body.status && !body.error) {
        check = { state: 'ok', message: 'Connected! Your key works.' };
      } else {
        check = { state: 'failed', message: body.error || body.status || 'The key did not work.' };
      }
    } catch (err) {
      check = { state: 'failed', message: err instanceof Error ? err.message : String(err) };
    }
    if (seq === seqRef.current) {
      setResult({ signature, check });
    }
  };

  // A pasted or typed key tests itself once it has settled
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => {
    if (!key?.trim() || testedRef.current === signature) {
      return undefined;
    }
    const timer = setTimeout(() => {
      void runRef.current();
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [key, signature]);

  const check: KeyCheck = result?.signature === signature ? result.check : { state: 'idle' };
  return { check, run };
}

function KeyCheckStatus({ check, onTest }: { check: KeyCheck; onTest: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginTop: 1 }}>
      {check.state === 'ok' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'success.main' }}>
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">{check.message}</Typography>
        </Box>
      ) : null}
      {check.state === 'failed' ? (
        <Typography variant="body2" align="center" sx={{ color: 'error.main' }}>
          {check.message}
        </Typography>
      ) : null}
      <Button loading={check.state === 'testing'} onClick={onTest} color="primary" variant="outlined">
        Test
      </Button>
    </Box>
  );
}

function OpenAISetupPage({ setPage }: PageProps) {
  const { aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const openaiKey = useSetting<string>(SettingsEnum.OPENAI_KEY, '');
  const { check, run } = useKeyCheck(ApiType.OpenAI, openaiKey.value);

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
            onClick={() => {
              setPage(WizardPage.AI_PROVIDER_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={check.state !== 'ok'}
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
        <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" onBlur={() => void run()} />
      </List>
      <KeyCheckStatus check={check} onTest={() => void run(true)} />
    </WizardStep>
  );
}

function GeminiSetupPage({ setPage }: PageProps) {
  const { aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const geminiKeys = useSetting<string>(SettingsEnum.GEMINI_KEYS, '');
  const { check, run } = useKeyCheck(ApiType.Gemini, geminiKeys.value);

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
            disabled={check.state !== 'ok'}
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
        <ApiKeyAIComponent setting={SettingsEnum.GEMINI_KEYS} aiName="Gemini" onBlur={() => void run()} />
      </List>
      <KeyCheckStatus check={check} onTest={() => void run(true)} />
    </WizardStep>
  );
}

function SelfHostedSetupPage({ setPage }: PageProps) {
  const { aiApiTypeSetting } = useAISettings();
  const { setSetting: setAiApiType } = aiApiTypeSetting;
  const selected = ApiTypeFromValue(aiApiTypeSetting.value);
  const selfHostedType = selected === ApiType.VLLM ? ApiType.VLLM : ApiType.KoboldAI;
  const { check, run } = useKeyCheck(selfHostedType, undefined);

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
            disabled={check.state !== 'ok'}
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
      <KeyCheckStatus check={check} onTest={() => void run(true)} />
    </WizardStep>
  );
}

export function SetupWizardModal({ open, setOpen }: SetupWizardModalParameters) {
  const currentWizardPage = useSetting<WizardPage>(SettingsEnum.SETUP_WIZARD_PAGE, WizardPage.INIT);
  const setupComplete = useSetting<boolean>(SettingsEnum.SETUP_COMPLETE, false);
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
    close();
  };

  // No onClose: a click outside the wizard or Escape leaves it open; only its X closes it
  return (
    <Modal open={open}>
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
        {currentWizardPage.value === WizardPage.MICROPHONE_SETUP && <MicrophoneSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.ABOUT_YOU && <AboutYouPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.CONNECT_MOD && <ConnectModPage setPage={setPage} finish={finish} />}
        {currentWizardPage.value === WizardPage.INSTALL_MOD && <InstallModPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.ENABLE_MODS && <EnableModsPage setPage={setPage} />}
      </Box>
    </Modal>
  );
}
