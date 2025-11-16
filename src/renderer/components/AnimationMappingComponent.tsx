import { Box, Button, Chip, Divider, Modal, TextField, Tooltip, Typography } from '@mui/material';
import { Animation } from 'main/sentient-sims/models/Animation';
import { IpcRendererEvent } from 'electron';
import { getSexLocation } from 'main/sentient-sims/descriptions/wwDescriptions';
import {
  ActorMapping,
  formatListToString,
  getMappingStringErrorPairs,
  getMappingStringReplacementPairs,
} from 'main/sentient-sims/formatter/PromptFormatter';
import { WWEventType, WWInteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { InteractionEventResult } from 'main/sentient-sims/models/InteractionEventResult';
import log from 'electron-log';
import { LoadingButton } from '@mui/lab';
import { appApiUrl } from 'main/sentient-sims/constants';
import { CreateMemoryRequest } from 'main/sentient-sims/models/GetMemoryRequest';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import SpaceBetweenDiv from './SpaceBetweenDiv';

type SimMappingRowProperties = {
  sentientSim: SentientSim;
  setInput: Dispatch<SetStateAction<string>>;
};

type ReplacementOutput = {
  outputNodes: ReactNode[];
  hasErrors: boolean;
  actionString: string;
};

export function replaceActorStringWithSimNames(targetString: string, replacements: ActorMapping[]): string {
  let actionString: string = targetString;

  replacements.forEach((replacement) => {
    actionString = actionString.replaceAll(replacement.actor, replacement.mapping);
  });

  return actionString;
}

export function replaceKeyValuePairs(
  targetString: string,
  replacements: ActorMapping[],
  errors: Map<string, string>,
): ReplacementOutput {
  let actionString: string[] = [targetString];
  let newLines: ReactNode[] = [targetString];
  let foundError = false;

  replacements.forEach((replacement) => {
    newLines = newLines.flatMap((node) => {
      if (typeof node !== 'string') {
        return [node];
      }

      const regex = new RegExp(`\\b${replacement.mapping}\\b`, 'gi');

      return node.split(regex).reduce((acc, value, index, array) => {
        acc.push(value);
        if (index < array.length - 1) {
          acc.push(
            <Tooltip title={replacement.actor} placement="top">
              <Chip label={replacement.mapping} variant="filled" />
            </Tooltip>,
          );
        }
        return acc;
      }, [] as ReactNode[]);
    });
  });

  replacements.forEach((replacement) => {
    actionString = actionString.flatMap((node) => {
      const regex = new RegExp(`\\b${replacement.mapping}\\b`, 'gi');

      return node.split(regex).reduce((acc, value, index, array) => {
        acc.push(value);
        if (index < array.length - 1) {
          acc.push(replacement.actor);
        }
        return acc;
      }, [] as string[]);
    });
  });

  errors.forEach((errorMessage, error) => {
    newLines = newLines.flatMap((node) => {
      if (typeof node !== 'string') {
        return [node];
      }

      const regex = new RegExp(`\\b${error}\\b`, 'gi');

      if (regex.test(node)) {
        foundError = true;
      }

      return node.split(regex).reduce((acc, value, index, array) => {
        acc.push(value);
        if (index < array.length - 1) {
          acc.push(
            <Tooltip title={errorMessage} placement="top">
              <Chip label={error} color="error" />
            </Tooltip>,
          );
        }
        return acc;
      }, [] as ReactNode[]);
    });
  });

  return {
    outputNodes: newLines,
    hasErrors: foundError,
    actionString: actionString.join(''),
  };
}

export function SimMappingRow({ sentientSim, setInput }: SimMappingRowProperties) {
  function add(piece: string) {
    // TODO: Input at cursor location instead of the end if the cursor is within the text box
    setInput((previousInput) => `${previousInput}${piece} `);
  }

  return (
    <Box>
      <Button onClick={() => add(`${sentientSim.name}`)}>{sentientSim.name}</Button>
      {sentientSim.gender === 'Male' ? (
        <>
          <Button onClick={() => add(`he.${sentientSim.name}`)}>he</Button>
          <Button onClick={() => add(`him.${sentientSim.name}`)}>him</Button>
          <Button onClick={() => add(`his.${sentientSim.name}`)}>his</Button>
          <Button onClick={() => add(`himself.${sentientSim.name}`)}>himself</Button>
        </>
      ) : (
        <>
          <Button onClick={() => add(`she.${sentientSim.name}`)}>she</Button>
          <Button onClick={() => add(`her.${sentientSim.name}`)}>her</Button>
          <Button onClick={() => add(`herself.${sentientSim.name}`)}>herself</Button>
        </>
      )}
    </Box>
  );
}

const aiClient = new AIClient();

export function AnimationMappingComponent() {
  const [event, setEvent] = useState<WWInteractionEvent | undefined | null>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<InteractionEventResult[]>([]);

  const onClose = () => {
    setTestResults([]);
    setEvent(null);
    setInput('');
    setLoading(false);
  };

  useEffect(() => {
    const removeListener = window.electron.onMapAnimation(
      (_event: IpcRendererEvent, interactionEvent: WWInteractionEvent) => {
        onClose();
        setEvent(interactionEvent);

        if (interactionEvent?.testing_action) {
          const formattedInput = replaceActorStringWithSimNames(
            interactionEvent.testing_action,
            getMappingStringReplacementPairs(interactionEvent.sentient_sims),
          );
          setInput(formattedInput);
        } else {
          const simNames = interactionEvent.sentient_sims.map((sim) => sim.name);
          const simNamesList = formatListToString(simNames);
          setInput(`${simNamesList} are `);
        }
      },
    );

    return () => {
      removeListener();
    };
  }, []);

  const rows: JSX.Element[] = [];
  if (event?.sentient_sims) {
    event.sentient_sims.forEach((sentientSim) => {
      rows.push(<SimMappingRow sentientSim={sentientSim} setInput={setInput} />);
    });
  }

  const output = replaceKeyValuePairs(
    input,
    getMappingStringReplacementPairs(event?.sentient_sims),
    getMappingStringErrorPairs(event?.sentient_sims),
  );

  async function handleSave(saveToMemory: boolean) {
    if (!event) {
      return;
    }

    async function handleSaveLocally() {
      if (!event) return;
      setLoading(true);

      const formattedOutput = replaceKeyValuePairs(
        input,
        getMappingStringReplacementPairs(event.sentient_sims),
        getMappingStringErrorPairs(event.sentient_sims),
      );

      const animation: Animation = {
        id: event.animation_identifier,
        name: event.animation_name,
        author: event.animation_author,
        act: formattedOutput.actionString,
      };

      try {
        await window.electron.ipcRenderer.invoke('save-animation-locally', animation);
      } catch (error) {
        log.error('Error saving animation locally:', error);
      }

      setLoading(false);
      onClose();
    }

    setLoading(true);

    const formattedOutput = replaceKeyValuePairs(
      input,
      getMappingStringReplacementPairs(event.sentient_sims),
      getMappingStringErrorPairs(event.sentient_sims),
    );

    const animation: Animation = {
      id: event.animation_identifier,
      name: event.animation_name,
      author: event.animation_author,
      act: formattedOutput.actionString,
    };

    try {
      await fetch(`${appApiUrl}/animations`, {
        method: 'POST',
        body: JSON.stringify(animation),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!testResults?.[0].memory) {
        throw Error('No test results present when saving animation');
      }

      if (saveToMemory) {
        const memory: CreateMemoryRequest = {
          memory: testResults[0].memory,
          participants: event.sentient_sims.map((sim) => {
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
      log.error('An error occurred saving animation:', error);
    }

    setLoading(false);
    onClose();
  }

  async function handleTest() {
    if (!event) {
      return;
    }

    const testOutput = replaceKeyValuePairs(
      input,
      getMappingStringReplacementPairs(event?.sentient_sims),
      getMappingStringErrorPairs(event?.sentient_sims),
    );

    setLoading(true);

    event.testing_action = testOutput.actionString;
    event.ww_event_type = WWEventType.ACTIVE;

    try {
      const results = await Promise.all([
        aiClient.interactionEvent(event),
        aiClient.interactionEvent(event),
        aiClient.interactionEvent(event),
      ]);

      setTestResults(results);
    } catch (error) {
      log.error('An error occurred:', error);
    }

    setLoading(false);
  }

  let postFix;
  if (event) {
    const sexLocation = getSexLocation(event.sex_location);
    postFix = (
      <Tooltip title="This is always appended to the end of the prompt" placement="top">
        <Chip label={sexLocation} variant="outlined" />
      </Tooltip>
    );
  }

  let testOutcome;
  if (testResults.length > 0) {
    testOutcome = [];
    testResults.forEach((result, index) => {
      testOutcome.push(<Typography sx={{ marginBottom: 1 }}>Test {index + 1}:</Typography>);
      testOutcome.push(
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {result.text}
        </Typography>,
      );
    });
  } else {
    testOutcome = (
      <>
        {rows}
        <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            multiline
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="small"
            // label={label}
            fullWidth
            sx={{ height: '100%', marginBottom: 1 }}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Prompt:
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 3 }}>
            {output.outputNodes} {postFix}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <Modal open={!!event} onClose={onClose}>
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
          {event?.animation_author}: {event?.animation_name} - {event?.animation_identifier}
        </Typography>
        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
        {testOutcome}
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
                    disabled={output.hasErrors}
                    sx={{ marginRight: 1 }}
                  >
                    Test
                  </LoadingButton>
                </div>
              )}
            </div>
            <div>
              <LoadingButton color="secondary" variant="outlined" onClick={() => onClose()}>
                Cancel
              </LoadingButton>
            </div>
          </SpaceBetweenDiv>
        </Box>
      </Box>
    </Modal>
  );
}
