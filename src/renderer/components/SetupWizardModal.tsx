import { LoadingButton } from '@mui/lab';
import { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Modal,
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { ModsDirectoryComponent } from 'renderer/ModsDirectoryComponent';
import { useVersions } from 'renderer/providers/VersionsProvider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ApiKeyAIComponent from 'renderer/ApiKeyAIComponent';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { AIStatusComponent } from 'renderer/AIStatusComponent';
import { ApiType } from 'main/sentient-sims/models/ApiType';
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

function InitialSetupPage({ setPage }: PageProps) {
  return (
    <>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography align="center" variant="h6" gutterBottom>
            Welcome to Sentient Sims!
          </Typography>
          <Typography align="center" variant="body1" gutterBottom>
            {'If you want to restart the Wizard, open Settings -> Setup Wizard'}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.MOD_SETUP)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

function ModSetupPage({ setPage }: PageProps) {
  const versions = useVersions();

  return (
    <>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
          }}
        >
          <Typography align="center" variant="h6" gutterBottom>
            Mod Setup
          </Typography>
          <Typography align="center" gutterBottom>
            Select the Sims 4 Mods directory. The default has already been selected.
          </Typography>
          <Typography align="center" gutterBottom sx={{ mb: 2 }}>
            If you have OneDrive or a non-default Sims 4 Mods directory, you will need to select a different Mods
            folder.
          </Typography>
          <ModsDirectoryComponent />
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }} flexDirection="column">
            <VersionFormHelper text="Game Version" version={versions.game} />
            {versions.game.version !== 'none' && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Sims 4 Mods folder successfully found
              </Typography>
            )}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            <LoadingButton
              type="submit"
              loading={versions.loading}
              onClick={() => versions.refresh()}
              color="secondary"
              variant="contained"
              endIcon={versions.game.version !== 'none' ? <CheckCircleOutlineIcon /> : undefined}
            >
              Test
            </LoadingButton>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          loading={versions.loading}
          onClick={() => setPage(WizardPage.INIT)}
          color="secondary"
          variant="contained"
          sx={{ marginRight: 4 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          loading={versions.loading}
          onClick={() => setPage(WizardPage.INSTALL_MOD)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
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
  data: {
    header?: string;
    points: CardPoint[];
  }[];
}

const cardData: CardData[] = [
  {
    header: 'Sentient Sims AI',
    page: WizardPage.SENTIENT_SIMS_AI_SETUP,
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
        points: ['Pay-as-you-go', 'Usage based', 'Free trial'],
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
    <>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Install the mod
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            The app will install the newest version of the mod.
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            When a new version of the mod is available, you will see it on the home screen.
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            You will manually install new versions of the mod by updating on the home screen.
          </Typography>
          <Typography align="center" sx={{ mb: 5 }}>
            New versions of the app install automatically.
          </Typography>
          <Box sx={{ width: '100%' }} justifyContent="center" alignItems="center" display="flex">
            <UpdateComponent />
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.MOD_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

function ConnectModPage({ setPage, setOpen }: PageProps) {
  const { status } = useWebsocket();

  return (
    <>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Connect to The Sims 4
      </Typography>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
          }}
        >
          <List sx={{ listStyle: 'decimal', pl: 2 }} dense>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Open The Sims 4</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>
                If you have never played with Sims 4 mods before, enable mods{' '}
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
              <ListItemText>Make sure to restart the game if you just enabled mods for the first time</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>Create a new game, or load an old one so that you can see and control a Sim</ListItemText>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText>The connection should now show that the mod and app are connected</ListItemText>
            </ListItem>
          </List>
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 3 }} flexDirection="column">
            <Typography variant="body2">Connection Status: </Typography>
            <Typography variant="body2" color={status.mod ? 'success.main' : 'error.main'} sx={{ mt: 1 }}>
              {status.mod ? 'Connected Successfully' : 'Not connected'}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          onClick={() => {
            if (setOpen) {
              setOpen(false);
            }
          }}
          color="secondary"
          variant="contained"
        >
          Finish
        </LoadingButton>
      </Box>
    </>
  );
}

function AIProviderPage({ setPage }: PageProps) {
  return (
    <>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
          }}
        >
          <Box sx={{ maxWidth: '1200px', width: '100%' }}>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Choose which AI service you would like to use for your game.
            </Typography>
            <Grid container spacing={2} justifyContent="center" alignItems="stretch" sx={{ marginBottom: 4 }}>
              {cardData.map((card) => (
                <Grid item key={card.header} xs={12} sm={6} md={4} lg={2.4}>
                  <Card
                    sx={{
                      'height': '100%',
                      'display': 'flex',
                      'flexDirection': 'column',
                      'borderRadius': 2, // Softer corners
                      'border': '1px solid #444',
                      'transition': 'border-color 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }} onClick={() => setPage(card.page)}>
                      <Typography variant="h5" component="div" gutterBottom>
                        {card.header}
                      </Typography>
                      {card.data.map((asdf) => (
                        <>
                          {asdf?.header && <Typography variant="subtitle1">{asdf.header}</Typography>}

                          <List dense>
                            {asdf.points.map((point, pointIndex) => (
                              <ListItem key={pointIndex} disablePadding disableGutters>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <FiberManualRecordIcon
                                    sx={{
                                      fontSize: '0.6rem',
                                      color: 'text.secondary',
                                    }}
                                  />
                                </ListItemIcon>
                                {typeof point === 'string' ? (
                                  <ListItemText primary={point} />
                                ) : (
                                  <ListItemText>
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
                        </>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.INSTALL_MOD)}
          color="secondary"
          variant="contained"
        >
          Back
        </LoadingButton>
      </Box>
    </>
  );
}

function SentientSimsAISetupPage({ setPage }: PageProps) {
  const { aiStatus, aiApiTypeSetting } = useAISettings();
  const { userAttributes } = useAuth();
  const patreonUser = new PatreonUser(userAttributes);

  useEffect(() => {
    aiApiTypeSetting.setSetting(ApiType.SentientSimsAI);
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
  const isPatreonLinked = userAttributes && patreonUser.isPatreonLinked();
  const isSubscriber = userAttributes && patreonUser.isPatreonLinked() && patreonUser.isSubscriber();

  let isLoggedInColor: string | undefined;
  if (isLoggedIn) {
    isLoggedInColor = 'success.main';
  }

  let isPatreonLinkedColor: string | undefined;
  if (isPatreonLinked) {
    isPatreonLinkedColor = 'success.main';
  }

  let isSubscriberColor: string | undefined;
  if (isSubscriber) {
    isSubscriberColor = 'success.main';
  }

  return (
    <>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Sentient Sims AI Setup
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Stepper activeStep={activeStep} sx={{ width: '70%' }}>
          <Step key="login" completed={isLoggedIn}>
            <StepLabel>
              <Typography variant="body2" color={isLoggedInColor}>
                {userAttributes ? 'Log In or Create a New Account' : 'Logged In'}
              </Typography>
            </StepLabel>
          </Step>
          <Step key="link-patreon" completed={isPatreonLinked}>
            <StepLabel>
              <Typography variant="body2" color={isPatreonLinkedColor}>
                {isPatreonLinked ? 'Link Patreon' : 'Patreon Linked'}
              </Typography>
            </StepLabel>
          </Step>
          <Step key="subscribe-patreon" completed={isSubscriber}>
            <StepLabel>
              <Typography variant="body2" color={isSubscriberColor}>
                {isSubscriber ? 'Subscribed Successfully' : 'Subscribe to Patreon'}
              </Typography>
            </StepLabel>
          </Step>
        </Stepper>
      </Box>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
          }}
        >
          {!userAttributes && notLoggedIn}
          {userAttributes && !patreonUser.isPatreonLinked() && <PatreonLinkingComponent />}
          {userAttributes && patreonUser.isPatreonLinked() && !patreonUser.isSubscriber() && (
            <PatreonSubscribingComponent />
          )}
          {userAttributes && patreonUser.isPatreonLinked() && patreonUser.isSubscriber() && (
            <Box minWidth={400} minHeight={400} justifyContent="center" alignItems="center" sx={{ display: 'flex' }}>
              <Typography variant="body2" sx={{ marginRight: 1 }}>
                Patreon Setup Complete
              </Typography>
              <CheckCircleOutlineIcon />
            </Box>
          )}
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          loading={aiStatus.loading}
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          loading={aiStatus.loading}
          onClick={() => setPage(WizardPage.CONNECT_MOD)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

function OpenAISetupPage({ setPage }: PageProps) {
  const { testAI, aiStatus, aiApiTypeSetting } = useAISettings();

  useEffect(() => {
    aiApiTypeSetting.setSetting(ApiType.OpenAI);
  }, [aiApiTypeSetting]);

  return (
    <>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Open AI Setup
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            You must create an Open AI platform account and generate an API key.
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            The key allows you to use the API version of ChatGPT which is a pay-as-you-go service.
          </Typography>
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
            <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
          </List>
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
              <AIStatusComponent />
            </Box>
            <LoadingButton
              loading={aiStatus.loading}
              onClick={() => testAI()}
              sx={{ marginRight: 2 }}
              color="primary"
              variant="outlined"
            >
              Test
            </LoadingButton>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          loading={aiStatus.loading}
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          loading={aiStatus.loading}
          onClick={() => setPage(WizardPage.CONNECT_MOD)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

function GeminiSetupPage({ setPage }: PageProps) {
  return (
    <>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Gemini AI Setup
      </Typography>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
          }}
        >
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Wizard under construction. If you want to setup Gemini, use the Settings page and enter your API key from
            Gemini
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.CONNECT_MOD)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

function SelfHostedSetupPage({ setPage }: PageProps) {
  return (
    <>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Self Hosted Setup
      </Typography>
      <Box flexGrow={1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
          }}
        >
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Wizard under construction for self hosted setup, check the Wiki.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.AI_PROVIDER_SETUP)}
          color="secondary"
          variant="contained"
          sx={{ mr: 2 }}
        >
          Back
        </LoadingButton>
        <LoadingButton
          type="submit"
          onClick={() => setPage(WizardPage.CONNECT_MOD)}
          color="secondary"
          variant="contained"
        >
          Next
        </LoadingButton>
      </Box>
    </>
  );
}

export function SetupWizardModal({ open, setOpen }: SetupWizardModalParameters) {
  const currentWizardPage = useSetting<string>(SettingsEnum.SETUP_WIZARD_PAGE, WizardPage.INIT);
  const setPage = (wizardPage: WizardPage) => {
    currentWizardPage.setSetting(wizardPage.toString());
  };

  useEffect(() => {
    if (!open && currentWizardPage.value === WizardPage.SENTIENT_SIMS_AI_SETUP) {
      setOpen(true);
    }
  }, [currentWizardPage.value, open, setOpen]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setPage(WizardPage.INIT);
        setOpen(false);
      }}
    >
      <Box
        minHeight="90%"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography align="center" variant="h4" sx={{ marginBottom: 2 }}>
          Setup Wizard
        </Typography>
        {currentWizardPage.value === WizardPage.INIT && <InitialSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.MOD_SETUP && <ModSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.AI_PROVIDER_SETUP && <AIProviderPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.SENTIENT_SIMS_AI_SETUP && <SentientSimsAISetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.OPEN_AI_SETUP && <OpenAISetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.GEMINI_SETUP && <GeminiSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.SELF_HOSTED_SETUP && <SelfHostedSetupPage setPage={setPage} />}
        {currentWizardPage.value === WizardPage.CONNECT_MOD && <ConnectModPage setPage={setPage} setOpen={setOpen} />}
        {currentWizardPage.value === WizardPage.INSTALL_MOD && <InstallModPage setPage={setPage} />}
      </Box>
    </Modal>
  );
}
