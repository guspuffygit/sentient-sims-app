/* eslint-disable no-plusplus */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { appApiUrl } from 'main/sentient-sims/constants';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';
import { BlankDataGridFooterComponent } from './components/BlankDataGridFooter';
import { useOnDatabaseLoaded } from './hooks/useOnDatabaseLoaded';

type SelectedSim = {
  sim: ParticipantDTO;
  index: number;
};

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 150, hideable: true },
  { field: 'name', headerName: 'Name', width: 250 },
  {
    field: 'description',
    headerName: 'Description',
    width: 2000,
  },
];

export default function SimsPage() {
  const [sims, setSims] = useState<ParticipantDTO[]>([]);
  const [editedSim, setEditedSim] = useState<SelectedSim | null | undefined>();

  function getSims() {
    fetch(`${appApiUrl}/participants`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((simsResponse: ParticipantDTO[]) => {
        setSims(simsResponse);
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
    [sims]
  );

  async function handleSave() {
    if (editedSim) {
      log.debug(`Edited Sim: ${JSON.stringify(editedSim.sim)}`);

      try {
        const url = `${appApiUrl}/participants/${editedSim.sim.id}`;

        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedSim.sim),
        });
      } catch (error: any) {
        log.error('Error saving updated sim', error);
        if (error.cause) {
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
        await fetch(`${appApiUrl}/participants/${editedSim.sim.id}`, {
          method: 'DELETE',
        });
      } catch (error: any) {
        log.error('Deletion of sim failed', error);
        if (error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedSim(-1);
    getSims();
  }, [editedSim, handleSetSelectedSim]);

  const handleDescriptionEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedSim((previousSim) => ({
        index: Number(previousSim?.index),
        sim: {
          id: previousSim?.sim?.id || '',
          name: previousSim?.sim?.name || '',
          description: event.target.value,
        },
      }));
    },
    []
  );
  if (sims.length > 0) {
    let editSimBox;

    if (editedSim) {
      editSimBox = (
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
                  onClick={() => handleSetSelectedSim(-1)}
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
          <Typography sx={{ marginBottom: 2 }}>
            Name: {editedSim.sim.name}
          </Typography>
          <MemoryEditInput
            label="Description"
            handleEdit={handleDescriptionEdit}
            rows={5}
            forceShow
            value={editedSim?.sim?.description}
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
                slots={{
                  footer: BlankDataGridFooterComponent,
                }}
                onRowSelectionModelChange={(selectedRow) => {
                  try {
                    for (let i = 0; i < sims.length; i++) {
                      const sim = sims[i];
                      if (sim.id === selectedRow[0]) {
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

  return <AppCard>No game loaded yet</AppCard>;
}
