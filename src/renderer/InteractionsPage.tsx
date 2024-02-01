/* eslint-disable no-plusplus */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Fab,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState, JSX } from 'react';
import log from 'electron-log';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { appApiUrl } from 'main/sentient-sims/constants';
import { InteractionDTO } from 'main/sentient-sims/db/dto/InteractionDTO';
import { InteractionClient } from 'main/sentient-sims/clients/InteractionClient';
import { LoadingButton } from '@mui/lab';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { InteractionEventResult } from 'main/sentient-sims/models/InteractionEventResult';
import {
  formatListToString,
  getMappingStringErrorPairs,
  getMappingStringReplacementPairs,
} from 'main/sentient-sims/formatter/PromptFormatter';
import { CreateMemoryRequest } from 'main/sentient-sims/models/GetMemoryRequest';
import {
  SimMappingRow,
  replaceActorStringWithSimNames,
  replaceKeyValuePairs,
} from './components/AnimationMappingComponent';
import SpaceBetweenDiv from './components/SpaceBetweenDiv';
import { BlankDataGridFooterComponent } from './components/BlankDataGridFooter';
import AppCard from './AppCard';
import { useSnackBar } from './providers/SnackBarProvider';

const interactionClient = new InteractionClient();

const aiClient = new AIClient();

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<InteractionDTO[]>([]);
  const [editingInteraction, setEditingInteraction] = useState<
    InteractionDTO | undefined | null
  >();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<InteractionEventResult[]>([]);

  const { showMessage } = useSnackBar();

  const onClose = () => {
    setTestResults([]);
    setEditingInteraction(null);
    setInput('');
    setLoading(false);
  };

  async function getInteractionDescriptions() {
    try {
      setInteractions(await interactionClient.getInteractions());
    } catch (err: any) {
      // ignore
    }
  }

  useEffect(() => {
    const removeListener = window.electron.onInteractionsChanged(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_event: any) => {
        // Reload interactions
        getInteractionDescriptions();
      }
    );

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    getInteractionDescriptions();
  }, []);

  async function handleSave(saveToMemory: boolean) {
    if (!editingInteraction || !editingInteraction.event) {
      return;
    }

    setLoading(true);

    try {
      if (!testResults?.[0].memory) {
        throw Error('No test results present when saving interaction');
      }

      if (saveToMemory) {
        const memory: CreateMemoryRequest = {
          memory: testResults[0].memory,
          participants: editingInteraction.event.sentient_sims.map((sim) => {
            return {
              id: sim.sim_id,
            };
          }),
        };
        await fetch(`${appApiUrl}/memories`, {
          method: 'POST',
          body: JSON.stringify(memory),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      log.error('An error occurred saving memory:', error);
      showMessage('An error occurred saving memory', 'error');
    }

    setLoading(false);
    onClose();
  }

  async function handleTest() {
    if (!editingInteraction || !editingInteraction.event) {
      return;
    }

    const formattedOutput = replaceKeyValuePairs(
      input,
      getMappingStringReplacementPairs(editingInteraction.event.sentient_sims),
      getMappingStringErrorPairs(editingInteraction.event.sentient_sims)
    );

    setLoading(true);

    const editedInteraction: InteractionDTO = {
      name: editingInteraction.name,
      event: editingInteraction.event,
      action: formattedOutput.actionString,
      ignored: undefined,
    };

    await interactionClient.updateInteraction(editedInteraction);

    try {
      const results = await Promise.all([
        aiClient.interactionEvent(editingInteraction.event),
        aiClient.interactionEvent(editingInteraction.event),
        aiClient.interactionEvent(editingInteraction.event),
      ]);

      setTestResults(results);
    } catch (error) {
      log.error('An error occurred:', error);
    }

    setLoading(false);
  }

  async function handleCopy() {
    try {
      const text = await interactionClient.getModifiedInteractions();
      if (text) {
        await navigator.clipboard.writeText(text);
        showMessage(
          'Copied interactions to clipboard.\n\nPaste into interactionDescriptions.ts'
        );
      } else {
        showMessage('No modifed interactions copied to clipboard', 'warning');
      }
    } catch (err: any) {
      showMessage('No modifed interactions copied to clipboard', 'warning');
    }
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'ignored',
      headerName: 'Ignored',
      valueGetter: (params) => !!params.row.ignored,
      renderCell: (params) => {
        const onClick = async (e: any) => {
          e.stopPropagation();

          const interaction: InteractionDTO = {
            name: params.row?.name,
            ignored: !params.row?.ignored || undefined,
            action: params.row?.action || undefined,
            event: params.row?.event || undefined,
          };

          if (interaction.ignored) {
            interaction.action = undefined;
          }

          await interactionClient.updateInteraction(interaction);
        };

        return <Checkbox checked={params.row?.ignored} onChange={onClick} />;
      },
      width: 70,
    },
    {
      field: 'sims',
      headerName: 'Sims',
      width: 50,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 390,
    },
    {
      field: 'delete',
      headerName: '',
      width: 75,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params) => {
        const onClick = async (e: any) => {
          e.stopPropagation();

          log.info(`Deleting: ${params.row?.name}`);
          await interactionClient.deleteInteraction(params.row?.name);
          getInteractionDescriptions();
        };

        return (
          <Button variant="outlined" onClick={onClick}>
            Delete
          </Button>
        );
      },
    },
  ];

  let interactionResults = null;
  let hasErrors = false;
  if (testResults.length > 0) {
    interactionResults = [];
    testResults.forEach((result, index) => {
      interactionResults.push(
        <Typography sx={{ marginBottom: 1 }}>Test {index + 1}:</Typography>
      );
      interactionResults.push(
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {result.text}
        </Typography>
      );
    });
  } else if (editingInteraction && editingInteraction.event) {
    const output = replaceKeyValuePairs(
      input,
      getMappingStringReplacementPairs(editingInteraction.event.sentient_sims),
      getMappingStringErrorPairs(editingInteraction.event.sentient_sims)
    );

    hasErrors = output.hasErrors;

    const mappingRows: JSX.Element[] = [];
    if (editingInteraction.event.sentient_sims) {
      editingInteraction.event.sentient_sims.forEach((sentientSim) => {
        mappingRows.push(
          <SimMappingRow sentientSim={sentientSim} setInput={setInput} />
        );
      });
    }
    interactionResults = (
      <>
        {mappingRows}
        <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            multiline
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="small"
            fullWidth
            sx={{ height: '100%', marginBottom: 1 }}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Prompt:
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 3 }}>
            {output.outputNodes}
          </Typography>
        </Box>
      </>
    );
  }

  if (interactions.length > 0) {
    return (
      <div>
        <Card
          sx={{
            minWidth: 275,
            maxHeight: 700,
            marginBottom: 2,
            overflow: 'auto',
            position: 'relative', // Add this line to position the FAB absolutely with respect to the Card
          }}
        >
          <CardContent>
            <div
              style={{
                height: 700,
                width: '100%',
              }}
            >
              <Fab
                size="small"
                color="primary"
                aria-label="copy"
                sx={{
                  position: 'absolute', // Changed from 'relative' to 'absolute'
                  top: 24, // Adjust the top value as needed
                  right: 30, // Adjust the right value as needed
                  zIndex: 10, // Ensure the button is above other elements if necessary
                }}
                onClick={() => handleCopy()}
              >
                <ContentCopyIcon />
              </Fab>
              <DataGrid
                rows={interactions.map((interaction, index) => {
                  return {
                    id: index,
                    ...interaction,
                    sims: interaction.event?.sentient_sims?.length || 0,
                  };
                })}
                columns={columns}
                slots={{
                  footer: BlankDataGridFooterComponent,
                }}
                onRowSelectionModelChange={(selectedRow) => {
                  const interaction = interactions[selectedRow[0] as number];
                  if (interaction.event) {
                    setEditingInteraction(interaction);
                    if (interaction?.action) {
                      const formattedInput = replaceActorStringWithSimNames(
                        interaction.action,
                        getMappingStringReplacementPairs(
                          interaction.event.sentient_sims
                        )
                      );
                      setInput(formattedInput);
                    } else {
                      const simNames = interaction.event.sentient_sims.map(
                        (sim) => sim.name
                      );
                      const simNamesList = formatListToString(simNames);
                      setInput(`${simNamesList} are `);
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Modal open={!!editingInteraction} onClose={onClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1000,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography>
              Interaction: {editingInteraction?.event?.interaction_name}
            </Typography>
            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
            {interactionResults}
            <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
            <Box>
              <SpaceBetweenDiv>
                <div>
                  {testResults.length > 0 ? (
                    <div>
                      <Tooltip title="This will save the animation mapping, and add Test 1 to your Sims memories.">
                        <LoadingButton
                          loading={loading}
                          color="secondary"
                          variant="outlined"
                          onClick={() => handleSave(true)}
                          sx={{ marginRight: 1 }}
                        >
                          Save + Add Memory
                        </LoadingButton>
                      </Tooltip>
                      <Tooltip title="This will save the animation mapping without modifying Sims memories.">
                        <LoadingButton
                          loading={loading}
                          color="secondary"
                          variant="outlined"
                          onClick={() => handleSave(false)}
                          sx={{ marginRight: 1 }}
                        >
                          Save
                        </LoadingButton>
                      </Tooltip>
                      <LoadingButton
                        loading={loading}
                        color="secondary"
                        variant="outlined"
                        onClick={() => setTestResults([])}
                      >
                        Edit
                      </LoadingButton>
                    </div>
                  ) : (
                    <div>
                      <LoadingButton
                        loading={loading}
                        color="secondary"
                        variant="outlined"
                        onClick={() => handleTest()}
                        disabled={hasErrors}
                        sx={{ marginRight: 1 }}
                      >
                        Test
                      </LoadingButton>
                    </div>
                  )}
                </div>
                <div>
                  <LoadingButton
                    color="secondary"
                    variant="outlined"
                    onClick={() => onClose()}
                  >
                    Cancel
                  </LoadingButton>
                </div>
              </SpaceBetweenDiv>
            </Box>
          </Box>
        </Modal>
      </div>
    );
  }

  return <AppCard>No game loaded yet</AppCard>;
}
