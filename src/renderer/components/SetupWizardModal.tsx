import {
  Button,
  Modal,
  Box,
  Chip,
  Grid,
  IconButton,
  Typography,
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { AIStatusComponent } from 'renderer/AIStatusComponent';
import { ApiType, ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { ProviderConnectionPanel } from 'renderer/settings/ProviderConnectionPanel';
import UpdateComponent from 'renderer/UpdateComponent';
import { useWebsocket } from 'renderer/providers/WebsocketProvider';
import useSetting from 'renderer/hooks/useSetting';
import { WizardPage } from 'main/sentient-sims/models/WizardPage';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import { VersionFormHelper } from './VersionFormHelper';
import { LoginComponent } from './LoginComponent';
import { PatreonLinkingComponent } from './PatreonLinkingComponent';
import { PatreonSubscribingComponent } from './PatreonSubscribingComponent';

export type SetupWizardModalParameters = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

interface PageProps {
  setPage: (wizardPage: WizardPage) => void;

  setOpen?: (open: boolean) => void;
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

function InitialSetupPage({ setPage }: PageProps) {
  return (
    <WizardStep
      actions={
        <Button
          variant="contained"
          onClick={() => {
            setPage(WizardPage.MOD_SETUP);
          }}
        >
          Get Started
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '18px',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: '#ffffff',
            boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}55`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 30 }} />
        </Box>
        <Typography variant="h5" sx={{ marginTop: 2.5 }}>
          Welcome to Sentient Sims!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1, maxWidth: 420 }}>
          This wizard walks you through installing the mod, picking an AI provider, and connecting to your game. You can
          rerun it anytime from Settings → Setup Wizard.
        </Typography>
      </Box>
    </WizardStep>
  );
}

function ModSetupPage({ setPage }: PageProps) {
  const versions = useVersions();

  return (
    <WizardStep
      title="Mod Setup"
      description="Select your Sims 4 Mods directory. The default is already selected — if you use OneDrive or a non-default Mods folder, pick it here."
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            loading={versions.loading}
            onClick={() => {
              setPage(WizardPage.INIT);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            loading={versions.loading}
            onClick={() => {
              setPage(WizardPage.INSTALL_MOD);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <ModsDirectoryComponent />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: 2,
        }}
      >
        <VersionFormHelper text="Game Version" version={versions.game} />
        {versions.game.version !== 'none' && (
          <Typography
            variant="body2"
            sx={{
              color: 'success.main',
              mt: 1,
            }}
          >
            Sims 4 Mods folder successfully found
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          loading={versions.loading}
          onClick={() => {
            void versions.refresh();
          }}
          color="primary"
          variant="outlined"
          endIcon={versions.game.version !== 'none' ? <CheckCircleOutlineIcon /> : undefined}
        >
          Test
        </Button>
      </Box>
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
        points: ['Patreon', '$5 monthly', 'Unlimited Requests'],
      },
      {
        header: 'Features',
        points: ['Uncensored', 'Supports WickedWhims'],
      },
    ],
  },
  {
    header: 'OpenAI',
    page: WizardPage.OPEN_AI_SETUP,
    data: [
      {
        header: 'Cost',
        points: ['Refillable Credits', 'Usage based'],
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
        points: ['Pay-as-you-go', 'Usage based', 'Free trial (LOW 20/day)'],
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

function InstallModPage({ setPage }: PageProps) {
  return (
    <WizardStep
      title="Install the Mod"
      description="The app installs the newest version of the mod for you. When a mod update is available you'll see it on the home screen and install it with one click — the app itself updates automatically."
      actions={
        <>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setPage(WizardPage.MOD_SETUP);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPage(WizardPage.ENABLE_MODS);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <Box
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          width: '100%',
        }}
      >
        <UpdateComponent />
      </Box>
    </WizardStep>
  );
}

const optionsClient = new SentientSimsAppClient();

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

function ConnectModPage({ setPage, setOpen }: PageProps) {
  const { status } = useWebsocket();

  return (
    <WizardStep
      title="Connect to The Sims 4"
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
              if (setOpen) {
                setOpen(false);
              }
            }}
          >
            Finish
          </Button>
        </>
      }
    >
      <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>Open The Sims 4</ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>Create a new game, or load an old one so that you can see and control a Sim</ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText>The connection should now show that the mod and app are connected</ListItemText>
        </ListItem>
      </List>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          mt: 3,
        }}
      >
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: status.mod ? 'success.main' : 'error.main',
          }}
        />
        <Typography variant="body2" color={status.mod ? 'success.main' : 'error.main'}>
          {status.mod ? 'Connected Successfully' : 'Not connected'}
        </Typography>
      </Box>
    </WizardStep>
  );
}

function AIProviderPage({ setPage }: PageProps) {
  return (
    <WizardStep
      title="Choose your AI provider"
      description="The provider generates everything your Sims say and do. You can change it later in Settings."
      maxWidth={880}
      actions={
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setPage(WizardPage.INSTALL_MOD);
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
  const { userAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);

  useEffect(() => {
    void aiApiTypeSetting.setSetting(ApiType.SentientSimsAI);
  }, [aiApiTypeSetting]);

  const notLoggedIn = (
    <>
      <Typography align="center" sx={{ mb: 2 }}>
        Login or Create a new account
      </Typography>
      <LoginComponent />
    </>
  );

  let activeStep = 0;
  if (userAttributes) {
    activeStep += 1;
    if (patreonUser.isPatreonLinked()) {
      activeStep += 1;
      if (patreonUser.isSubscriber()) {
        activeStep += 1;
      }
    }
  }

  const isLoggedIn = !!userAttributes;
  const isPatreonLinked = !!userAttributes && patreonUser.isPatreonLinked();
  const isSubscriber = !!userAttributes && patreonUser.isPatreonLinked() && patreonUser.isSubscriber();

  return (
    <WizardStep
      title="Sentient Sims AI Setup"
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
              setPage(WizardPage.CONNECT_MOD);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      <Stepper activeStep={activeStep} sx={{ marginBottom: 4 }}>
        <Step key="login" completed={isLoggedIn}>
          <StepLabel>
            <Typography variant="body2" color={isLoggedIn ? 'success.main' : undefined}>
              {isLoggedIn ? 'Logged In' : 'Log In or Create a New Account'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="link-patreon" completed={isPatreonLinked}>
          <StepLabel>
            <Typography variant="body2" color={isPatreonLinked ? 'success.main' : undefined}>
              {isPatreonLinked ? 'Patreon Linked' : 'Link Patreon'}
            </Typography>
          </StepLabel>
        </Step>
        <Step key="subscribe-patreon" completed={isSubscriber}>
          <StepLabel>
            <Typography variant="body2" color={isSubscriber ? 'success.main' : undefined}>
              {isSubscriber ? 'Subscribed Successfully' : 'Subscribe to Patreon'}
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>
      {!userAttributes && notLoggedIn}
      {userAttributes && !patreonUser.isPatreonLinked() && <PatreonLinkingComponent />}
      {userAttributes && patreonUser.isPatreonLinked() && !patreonUser.isSubscriber() && (
        <PatreonSubscribingComponent />
      )}
      {userAttributes && patreonUser.isPatreonLinked() && patreonUser.isSubscriber() && (
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
          <Typography variant="body1">Patreon Setup Complete</Typography>
        </Box>
      )}
    </WizardStep>
  );
}

function OpenAISetupPage({ setPage }: PageProps) {
  const { testAI, aiStatus, aiApiTypeSetting } = useAISettings();

  useEffect(() => {
    void aiApiTypeSetting.setSetting(ApiType.OpenAI);
  }, [aiApiTypeSetting]);

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
              setPage(WizardPage.CONNECT_MOD);
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
        <ProviderConnectionPanel apiType={ApiType.OpenAI} />
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

  useEffect(() => {
    void aiApiTypeSetting.setSetting(ApiType.Gemini);
  }, [aiApiTypeSetting]);

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
              setPage(WizardPage.CONNECT_MOD);
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
        <ProviderConnectionPanel apiType={ApiType.Gemini} />
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
  const selected = ApiTypeFromValue(aiApiTypeSetting.value);
  const selfHostedType = selected === ApiType.VLLM ? ApiType.VLLM : ApiType.KoboldAI;

  // Visiting this page selects a self hosted provider, mirroring how the
  // other provider setup pages select theirs on mount
  useEffect(() => {
    if (selected !== ApiType.KoboldAI && selected !== ApiType.VLLM) {
      void aiApiTypeSetting.setSetting(ApiType.KoboldAI);
    }
  }, [aiApiTypeSetting, selected]);

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
              setPage(WizardPage.CONNECT_MOD);
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
  const setPage = (wizardPage: WizardPage) => {
    void currentWizardPage.setSetting(wizardPage);
  };

  useEffect(() => {
    if (!open && currentWizardPage.value === WizardPage.SENTIENT_SIMS_AI_SETUP) {
      setOpen(true);
    }
  }, [currentWizardPage.value, open, setOpen]);

  const close = () => {
    setPage(WizardPage.INIT);
    setOpen(false);
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '9px',
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: '#ffffff',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
          </Box>
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
        {currentWizardPage.value === WizardPage.CONNECT_MOD && <ConnectModPage setPage={setPage} setOpen={setOpen} />}
        {currentWizardPage.value === WizardPage.INSTALL_MOD && <InstallModPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.ENABLE_MODS && <EnableModsPage setPage={setPage} />}
      </Box>
    </Modal>
  );
}
