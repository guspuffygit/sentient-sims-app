import { Box, Button, Card, CardActions, CardContent, Chip, Snackbar, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import log from 'electron-log';
import { DeleteMemoryRequest } from 'main/sentient-sims/models/GetMemoryRequest';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';
import { MemoryEditInput } from './components/MemoryEditInput';
import { rendererTiers } from './tiers/merge';
import { useDebugMode } from './providers/DebugModeProvider';
import { useWebsocket } from './providers/WebsocketProvider';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

// DEV: the pipeline behind a memory ("View Prompt")
const TraceDialog = rendererTiers.MemoryTraceDialog;

type SelectedMemory = {
  memory: MemoryEntity;
  index: number;
};

const client = new SentientSimsAppClient();

// V-4: "Milo (thought):" style tag from the row's owner + event_type. Skipped when the
// content already leads with the name (older rows carry "Name (thinking):", "Name (diary):",
// or "Name: line" transcripts) so nothing renders twice.
export function memoryNameTag(
  memory: { owner_name?: string; participant_names?: string[]; event_type?: string },
  body: string,
): string | undefined {
  const name = memory.owner_name ?? (memory.participant_names?.length === 1 ? memory.participant_names[0] : undefined);
  const kind = (memory.event_type ?? '').toLowerCase();
  const first = (memory.participant_names ?? [])[0];
  const leadName = name ?? first;
  if (!leadName || !body) {
    return undefined;
  }
  const opening = body.trimStart().toLowerCase();
  const alreadyTagged = (memory.participant_names ?? [])
    .concat(name ? [name] : [])
    .some((candidate) => candidate && opening.startsWith(candidate.toLowerCase()));
  if (alreadyTagged) {
    return undefined;
  }
  if (kind === 'thought' || kind === 'monologue') {
    return `${leadName} (thought):`;
  }
  if (kind === 'reflection') {
    return `${leadName} (diary):`;
  }
  if (kind === 'outcome') {
    return undefined;
  }
  return `${leadName}:`;
}

export default function MemoriesPage() {
  const textareaRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<MemoryEntity[]>([]);
  const [memoriesFocused, setMemoriesFocused] = useState(false);
  const memoriesFocusedRef = useRef(memoriesFocused);
  useEffect(() => {
    memoriesFocusedRef.current = memoriesFocused;
  }, [memoriesFocused]);
  const [editedMemory, setEditedMemory] = useState<SelectedMemory | null | undefined>();
  const { status } = useWebsocket();
  const debugMode = useDebugMode();
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  const copyInteractionName = (name: string) => {
    void navigator.clipboard.writeText(name);
    setCopiedSnackbar(true);
  };

  const addMemory = useCallback((memory: MemoryEntity) => {
    setMemories((previousMemories) => [...previousMemories, memory]);
  }, []);

  const deleteMemory = useCallback((deleteMemoryRequest: DeleteMemoryRequest) => {
    setMemories((previousMemories) => previousMemories.filter((memory) => memory.id !== deleteMemoryRequest.id));
  }, []);

  const editMemory = useCallback((memory: MemoryEntity) => {
    setMemories((previousMemories) => {
      return previousMemories.map((previousMemory) => {
        if (previousMemory.id === memory.id) {
          return memory;
        }
        return previousMemory;
      });
    });
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onNewMemoryAdded((_event: any, memory: MemoryEntity) => {
      addMemory(memory);
    });

    return () => {
      removeListener();
    };
  }, [addMemory]);

  useEffect(() => {
    // Scroll new memories into view, but only if the user isn't actively interacting with the list.
    // Read latest focus state via ref so this effect only re-runs when `memories` change.
    if (textareaRef.current && !memoriesFocusedRef.current) {
      textareaRef.current.scrollIntoView();
    }
  }, [memories]);

  function getMemories() {
    client.memories
      .getMemories()
      .then((memoriesResponse) => {
        setMemories(memoriesResponse);
        return memoriesResponse;
      })
      .catch(() => {
        // ignore
      });
  }

  // Try to load memories once
  useEffect(() => {
    getMemories();
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onDatabaseLoaded(() => {
      getMemories();
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onDatabaseUnloaded(() => {
      setMemories([]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleSetSelectedMemory = useCallback(
    (index: number) => {
      setTraceOpen(false);
      if (index < 0) {
        setEditedMemory(null);
      } else {
        setEditedMemory({
          memory: memories[index],
          index,
        });
      }
    },
    [memories],
  );

  useEffect(() => {
    const removeListener = window.electron.onMemoryDeleted((_event: any, deleteMemoryRequest: DeleteMemoryRequest) => {
      deleteMemory(deleteMemoryRequest);
      handleSetSelectedMemory(-1);
    });

    return () => {
      removeListener();
    };
  }, [deleteMemory, handleSetSelectedMemory]);

  useEffect(() => {
    const removeListener = window.electron.onMemoryEdited((_event: any, memory: MemoryEntity) => {
      editMemory(memory);
      handleSetSelectedMemory(-1);
    });

    return () => {
      removeListener();
    };
  }, [editMemory, handleSetSelectedMemory]);

  async function handleSave() {
    if (editedMemory) {
      log.debug(`Edited Memory: ${JSON.stringify(editedMemory.memory)}`);

      try {
        await client.memories.updateMemory(editedMemory.memory);
      } catch (error) {
        log.error('Error saving updated memory', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      } finally {
        handleSetSelectedMemory(-1);
      }
    } else {
      handleSetSelectedMemory(-1);
    }
  }

  const handleDelete = useCallback(async () => {
    if (editedMemory && editedMemory.memory.id) {
      try {
        await client.memories.deleteMemory(editedMemory.memory.id);
      } catch (error) {
        log.error('Deletion of memory failed', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      }
    } else {
      handleSetSelectedMemory(-1);
    }
  }, [editedMemory, handleSetSelectedMemory]);

  const handleObservationEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedMemory((previousMemory) => ({
      index: Number(previousMemory?.index),
      memory: {
        ...previousMemory?.memory,
        observation: event.target.value,
        location_id: Number(previousMemory?.memory.location_id),
      },
    }));
  }, []);

  const handleContentEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedMemory((previousMemory) => ({
      index: Number(previousMemory?.index),
      memory: {
        ...previousMemory?.memory,
        content: event.target.value,
        location_id: Number(previousMemory?.memory.location_id),
      },
    }));
  }, []);

  const handlePreActionEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedMemory((previousMemory) => ({
      index: Number(previousMemory?.index),
      memory: {
        ...previousMemory?.memory,
        pre_action: event.target.value,
        location_id: Number(previousMemory?.memory.location_id),
      },
    }));
  }, []);

  const handleActionEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedMemory((previousMemory) => ({
      index: Number(previousMemory?.index),
      memory: {
        ...previousMemory?.memory,
        action: event.target.value,
        location_id: Number(previousMemory?.memory.location_id),
      },
    }));
  }, []);

  if (!status.mod) {
    return (
      <EmptyState
        icon={<SportsEsportsOutlinedIcon />}
        title="Not connected to The Sims 4"
        description="Start a Sims 4 game to connect and see memories appear here."
      />
    );
  }

  if (memories.length > 0) {
    const renderText: any[] = [];

    memories.forEach((memory, index) => {
      // A content-less memory is served with its observation/pre_action as content so the
      // in-game window can render it, so drop the repeat instead of printing it twice
      const body = [memory.observation, memory.action, memory.content]
        .filter((m, i, all) => m && all.indexOf(m) === i)
        .join('\n');
      const tag = memoryNameTag(memory, body);
      renderText.push(
        <Typography
          variant="body2"
          onClick={() => {
            handleSetSelectedMemory(index);
          }}
          className="hoverHighlightTypography"
        >
          {tag ? (
            <Typography component="span" variant="body2" sx={{ color: 'text.secondary', marginRight: 0.5 }}>
              {tag}
            </Typography>
          ) : null}
          {body}
        </Typography>,
      );
      renderText.push(<Typography> </Typography>);
    });

    let editMemoryBox;

    if (editedMemory) {
      editMemoryBox = (
        <AppCard
          title="Edit Memory"
          icon={<EditNoteIcon fontSize="small" />}
          cardActions={
            <CardActions
              sx={{
                justifyContent: 'space-between',
                marginLeft: 1,
                marginRight: 1,
                marginBottom: 1,
              }}
            >
              <div>
                <Button
                  sx={{ marginRight: 1 }}
                  variant="contained"
                  onClick={() => {
                    void handleSave();
                  }}
                >
                  Save
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => {
                    handleSetSelectedMemory(-1);
                  }}
                >
                  Cancel
                </Button>
                {TraceDialog && debugMode.isEnabled && editedMemory.memory.id !== undefined && (
                  <Button
                    sx={{ marginLeft: 1 }}
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      setTraceOpen(true);
                    }}
                  >
                    View Prompt
                  </Button>
                )}
              </div>
              <div>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    void handleDelete();
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardActions>
          }
        >
          {editedMemory.memory.interaction_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mr: 1,
                }}
              >
                Interaction:
              </Typography>
              <Chip
                label={editedMemory.memory.interaction_name}
                size="small"
                variant="outlined"
                onClick={() => {
                  if (editedMemory.memory.interaction_name) {
                    copyInteractionName(editedMemory.memory.interaction_name);
                  }
                }}
                onDelete={() => {
                  if (editedMemory.memory.interaction_name) {
                    copyInteractionName(editedMemory.memory.interaction_name);
                  }
                }}
                deleteIcon={<ContentCopyIcon fontSize="small" />}
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            </Box>
          )}
          <MemoryEditInput
            label="Observation (Shown only to the AI)"
            handleEdit={handleObservationEdit}
            value={editedMemory.memory.observation}
          />
          <MemoryEditInput
            label="Pre Action (Shown only to the AI)"
            handleEdit={handlePreActionEdit}
            value={editedMemory.memory.pre_action}
          />
          <MemoryEditInput label="Action" handleEdit={handleActionEdit} value={editedMemory.memory.action} />
          <MemoryEditInput
            label="Content"
            handleEdit={handleContentEdit}
            rows={5}
            value={editedMemory.memory.content}
          />
        </AppCard>
      );
    }

    return (
      <div>
        <Card
          onMouseEnter={() => {
            setMemoriesFocused(true);
          }}
          onMouseLeave={() => {
            setMemoriesFocused(false);
          }}
          sx={{
            minWidth: 275,
            maxHeight: editedMemory ? 400 : 700,
            marginBottom: 2,
            overflow: 'auto',
          }}
        >
          <CardContent>
            {renderText}
            <div ref={textareaRef} />
          </CardContent>
        </Card>
        {editMemoryBox}
        {TraceDialog ? (
          <TraceDialog
            open={traceOpen}
            memoryId={editedMemory?.memory.id}
            onClose={() => {
              setTraceOpen(false);
            }}
          />
        ) : null}
        <Snackbar
          open={copiedSnackbar}
          autoHideDuration={1500}
          onClose={() => {
            setCopiedSnackbar(false);
          }}
          message="Copied to clipboard"
        />
      </div>
    );
  }

  return (
    <>
      <EmptyState
        icon={<AutoStoriesOutlinedIcon />}
        title="No memories yet"
        description="Interactions between Sims in game will appear here."
      />
      <Snackbar
        open={copiedSnackbar}
        autoHideDuration={1500}
        onClose={() => {
          setCopiedSnackbar(false);
        }}
        message="Copied to clipboard"
      />
    </>
  );
}
