/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { DeleteMemoryRequest } from 'main/sentient-sims/models/GetMemoryRequest';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';

type SelectedMemory = {
  memory: MemoryEntity;
  index: number;
};

export default function MemoriesPage() {
  const textareaRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<MemoryEntity[]>([]);
  const [memoriesFocused, setMemoriesFocused] = useState(false);
  const [editedMemory, setEditedMemory] = useState<
    SelectedMemory | null | undefined
  >();

  const addMemory = useCallback((memory: MemoryEntity) => {
    setMemories((previousMemories) => [...previousMemories, memory]);
  }, []);

  const deleteMemory = useCallback(
    (deleteMemoryRequest: DeleteMemoryRequest) => {
      setMemories((previousMemories) =>
        previousMemories.filter(
          (memory) => memory.id !== deleteMemoryRequest.id
        )
      );
    },
    []
  );

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
    const removeListener = window.electron.onNewMemoryAdded(
      (_event: any, memory: MemoryEntity) => {
        addMemory(memory);
      }
    );

    return () => {
      removeListener();
    };
  }, [addMemory]);

  useEffect(() => {
    if (textareaRef.current && !memoriesFocused) {
      textareaRef.current.scrollIntoView();
    }
    // This is needed otherwise when the mouse leaves the box it scrolls to the bottom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories]);

  function getMemories() {
    fetch(`${appApiUrl}/memories`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((memoriesResponse: MemoryEntity[]) => {
        setMemories(memoriesResponse);
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
      if (index < 0) {
        setEditedMemory(null);
      } else {
        setEditedMemory({
          memory: memories[index],
          index,
        });
      }
    },
    [memories]
  );

  useEffect(() => {
    const removeListener = window.electron.onMemoryDeleted(
      (_event: any, deleteMemoryRequest: DeleteMemoryRequest) => {
        deleteMemory(deleteMemoryRequest);
        handleSetSelectedMemory(-1);
      }
    );

    return () => {
      removeListener();
    };
  }, [deleteMemory, handleSetSelectedMemory]);

  useEffect(() => {
    const removeListener = window.electron.onMemoryEdited(
      (_event: any, memory: MemoryEntity) => {
        editMemory(memory);
        handleSetSelectedMemory(-1);
      }
    );

    return () => {
      removeListener();
    };
  }, [editMemory, handleSetSelectedMemory]);

  async function handleSave() {
    if (editedMemory) {
      log.debug(`Edited Memory: ${JSON.stringify(editedMemory.memory)}`);

      const url = `${appApiUrl}/memories/${editedMemory.memory.id}`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedMemory.memory),
      })
        .then((res) => res.json())
        .then(() => {})
        .catch((error: any) => {
          log.error('Error saving updated memory', error);
          if (error.cause) {
            log.error(error.cause);
          }
        })
        .finally(() => {
          handleSetSelectedMemory(-1);
        });
    } else {
      handleSetSelectedMemory(-1);
    }
  }

  const handleDelete = useCallback(() => {
    if (editedMemory) {
      fetch(`${appApiUrl}/memories/${editedMemory.memory.id}`, {
        method: 'DELETE',
      }).catch((error: any) => {
        log.error('Deletion of memory failed', error);
        if (error.cause) {
          log.error(error.cause);
        }
      });
    } else {
      handleSetSelectedMemory(-1);
    }
  }, [editedMemory, handleSetSelectedMemory]);

  const handleObservationEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedMemory((previousMemory) => ({
        index: Number(previousMemory?.index),
        memory: {
          id: previousMemory?.memory?.id,
          observation: event.target.value,
          pre_action: previousMemory?.memory?.pre_action,
          content: previousMemory?.memory?.content,
          location_id: Number(previousMemory?.memory?.location_id),
          timestamp: previousMemory?.memory?.timestamp,
        },
      }));
    },
    []
  );

  const handleContentEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedMemory((previousMemory) => ({
        index: Number(previousMemory?.index),
        memory: {
          id: previousMemory?.memory?.id,
          observation: previousMemory?.memory?.observation,
          pre_action: previousMemory?.memory?.pre_action,
          content: event.target.value,
          location_id: Number(previousMemory?.memory?.location_id),
          timestamp: previousMemory?.memory?.timestamp,
        },
      }));
    },
    []
  );

  const handlePreActionEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedMemory((previousMemory) => ({
        index: Number(previousMemory?.index),
        memory: {
          id: previousMemory?.memory?.id,
          observation: previousMemory?.memory?.observation,
          pre_action: event.target.value,
          content: previousMemory?.memory?.content,
          location_id: Number(previousMemory?.memory?.location_id),
          timestamp: previousMemory?.memory?.timestamp,
        },
      }));
    },
    []
  );
  if (memories.length > 0) {
    const renderText: any[] = [];

    memories.forEach((memory, index) => {
      renderText.push(
        <Typography
          variant="body2"
          onClick={() => handleSetSelectedMemory(index)}
          className="hoverHighlightTypography"
        >
          {[memory.observation, memory.content].filter((m) => m).join(' ')}
        </Typography>
      );
      renderText.push(<Typography> </Typography>);
    });

    let editMemoryBox;

    if (editedMemory) {
      editMemoryBox = (
        <AppCard
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
                  color="secondary"
                  variant="outlined"
                  onClick={() => handleSave()}
                >
                  Save
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => handleSetSelectedMemory(-1)}
                >
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleDelete()}
                >
                  Delete
                </Button>
              </div>
            </CardActions>
          }
        >
          <MemoryEditInput
            label="Observation (Shown only to the AI)"
            handleEdit={handleObservationEdit}
            value={editedMemory?.memory?.observation}
          />
          <MemoryEditInput
            label="Pre Action (Shown only to the AI)"
            handleEdit={handlePreActionEdit}
            value={editedMemory?.memory?.pre_action}
          />
          <MemoryEditInput
            label="Content"
            handleEdit={handleContentEdit}
            rows={5}
            value={editedMemory?.memory?.content}
          />
        </AppCard>
      );
    }

    return (
      <div>
        <Card
          onMouseEnter={() => setMemoriesFocused(true)}
          onMouseLeave={() => setMemoriesFocused(false)}
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
      </div>
    );
  }

  return <AppCard>No game loaded yet</AppCard>;
}
