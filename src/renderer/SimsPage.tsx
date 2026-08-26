import { Button, Card, CardActions, CardContent } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import log from 'electron-log';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { VoiceType } from 'main/sentient-sims/models/VoiceType';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';
import { MemoryEditInput } from './components/MemoryEditInput';
import { SimVoiceSelect, SimVoiceSelection } from './components/SimVoiceSelect';
import { KokoroSimVoiceSelect } from './components/KokoroSimVoiceSelect';
import { BlankDataGridFooterComponent } from './components/BlankDataGridFooter';
import { useOnDatabaseLoaded } from './hooks/useOnDatabaseLoaded';
import { useActiveVoiceType } from './hooks/useActiveVoiceType';
import { useWebsocket } from './providers/WebsocketProvider';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

type SelectedSim = {
  sim: ParticipantDTO;
  index: number;
};

const client = new SentientSimsAppClient();

export default function SimsPage() {
  const [sims, setSims] = useState<ParticipantDTO[]>([]);
  const [editedSim, setEditedSim] = useState<SelectedSim | null | undefined>();
  const { status } = useWebsocket();
  // Which provider's pinned voices the page shows and edits (ElevenLabs or Kokoro),
  // driven by the TTS provider selected in settings
  const activeVoiceType = useActiveVoiceType();

  const columns: GridColDef<ParticipantDTO>[] = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 150, hideable: true },
      { field: 'name', headerName: 'Name', width: 250 },
      {
        field: 'voice',
        headerName: 'Voice',
        width: 180,
        valueGetter: (_value: never, row: ParticipantDTO) => {
          const voice = activeVoiceType ? row.voices?.[activeVoiceType] : undefined;
          if (!voice?.voiceId) return 'Default';
          return voice.voiceName ?? voice.voiceId;
        },
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 2000,
      },
    ],
    [activeVoiceType],
  );

  function getSims() {
    client.participant
      .getParticipants()
      .then((participants) => {
        setSims(participants);
        return participants;
      })
      .catch(() => {
        // ignore
      });
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeListener = window.electron.onSimsChanged((_event: any) => {
      // Reload sims
      getSims();
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    getSims();
  }, []);

  useOnDatabaseLoaded(() => {
    getSims();
  });

  useEffect(() => {
    const removeListener = window.electron.onDatabaseLoaded(() => {
      getSims();
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onDatabaseUnloaded(() => {
      setSims([]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleSetSelectedSim = useCallback(
    (index: number) => {
      if (index < 0) {
        setEditedSim(null);
      } else {
        setEditedSim({
          sim: sims[index],
          index,
        });
      }
    },
    [sims],
  );

  async function handleSave() {
    if (editedSim) {
      log.debug(`Edited Sim: ${JSON.stringify(editedSim.sim)}`);

      try {
        const pinnedVoice = activeVoiceType ? editedSim.sim.voices?.[activeVoiceType] : undefined;
        await client.participant.updateParticipant({
          ...editedSim.sim,
          // The active type's voice is always sent so picking "Default" clears a
          // previously pinned voice; other voice types' pins are left untouched
          ...(activeVoiceType
            ? { voiceType: activeVoiceType, voiceId: pinnedVoice?.voiceId ?? '', voiceName: pinnedVoice?.voiceName }
            : {}),
        });
      } catch (error) {
        log.error('Error saving updated sim', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedSim(-1);
  }

  const handleDelete = useCallback(async () => {
    if (editedSim) {
      try {
        log.info(`Deleting Sim: ${editedSim.sim.id}`);
        await client.participant.deleteParticipant(editedSim.sim.id);
      } catch (error) {
        log.error('Deletion of sim failed', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedSim(-1);
    getSims();
  }, [editedSim, handleSetSelectedSim]);

  const handleDescriptionEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedSim((previousSim) => ({
      index: Number(previousSim?.index),
      sim: {
        ...previousSim?.sim,
        id: previousSim?.sim.id || '',
        name: previousSim?.sim.name || '',
        description: event.target.value,
      },
    }));
  }, []);

  const handleVoiceEdit = useCallback(
    (voice: SimVoiceSelection) => {
      if (!activeVoiceType) return;
      setEditedSim((previousSim) => ({
        index: Number(previousSim?.index),
        sim: {
          ...previousSim?.sim,
          id: previousSim?.sim.id || '',
          name: previousSim?.sim.name || '',
          voices: {
            ...previousSim?.sim.voices,
            [activeVoiceType]: voice.voiceId ? { voiceId: voice.voiceId, voiceName: voice.voiceName } : undefined,
          },
        },
      }));
    },
    [activeVoiceType],
  );

  if (!status.mod) {
    return (
      <EmptyState
        icon={<SportsEsportsOutlinedIcon />}
        title="Not connected to The Sims 4"
        description="Start a Sims 4 game to connect and manage your Sims here."
      />
    );
  }

  if (sims.length > 0) {
    let editSimBox;

    if (editedSim) {
      editSimBox = (
        <AppCard
          title="Edit Sim"
          subtitle={editedSim.sim.name}
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
                    handleSetSelectedSim(-1);
                  }}
                >
                  Cancel
                </Button>
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
          {activeVoiceType === VoiceType.ElevenLabs && (
            <SimVoiceSelect
              voiceId={editedSim.sim.voices?.[VoiceType.ElevenLabs]?.voiceId}
              voiceName={editedSim.sim.voices?.[VoiceType.ElevenLabs]?.voiceName}
              onChange={handleVoiceEdit}
            />
          )}
          {activeVoiceType === VoiceType.Kokoro && (
            <KokoroSimVoiceSelect
              voiceId={editedSim.sim.voices?.[VoiceType.Kokoro]?.voiceId}
              onChange={handleVoiceEdit}
            />
          )}

          <MemoryEditInput
            label="Description"
            handleEdit={handleDescriptionEdit}
            rows={5}
            forceShow
            value={editedSim.sim.description}
          />
        </AppCard>
      );
    }

    return (
      <div>
        <Card
          sx={{
            minWidth: 275,
            maxHeight: editedSim ? 400 : 700,
            marginBottom: 2,
            overflow: 'auto',
          }}
        >
          <CardContent>
            <div style={{ height: editedSim ? 315 : 700, width: '100%' }}>
              <DataGrid
                rows={sims}
                columns={columns}
                showToolbar
                // The footer (and with it the pagination controls) is hidden, so anything past the
                // grid's default 100-row page would be unreachable. -1 renders every row instead.
                pageSizeOptions={[{ value: -1, label: 'All' }]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: -1 } },
                  sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
                }}
                slots={{
                  footer: BlankDataGridFooterComponent,
                }}
                onRowSelectionModelChange={(selectedRow) => {
                  try {
                    const selectedId = selectedRow.ids.values().next().value;
                    for (let i = 0; i < sims.length; i++) {
                      const sim = sims[i];
                      if (sim.id === selectedId) {
                        setEditedSim({
                          sim,
                          index: i,
                        });
                        break;
                      }
                    }
                  } catch (err: any) {
                    log.error('ouch', err);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        {editSimBox}
      </div>
    );
  }

  return (
    <EmptyState
      icon={<PersonOutlineIcon />}
      title="No Sims yet"
      description="Edit a Sim's description in game to see them here."
    />
  );
}
