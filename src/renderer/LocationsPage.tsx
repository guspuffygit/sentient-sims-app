import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import { LocationEntity, LocationSource } from 'main/sentient-sims/db/entities/LocationEntity';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MessageImage } from 'main/sentient-sims/models/OpenAIMessage';
import { LotScreenshots } from './components/LotScreenshots';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';
import { MemoryEditInput } from './components/MemoryEditInput';
import { BlankDataGridFooterComponent } from './components/BlankDataGridFooter';
import { useOnDatabaseLoaded } from './hooks/useOnDatabaseLoaded';
import { useWebsocket } from './providers/WebsocketProvider';
import { useAuth } from './providers/AuthProvider';
import { useSnackBar } from './providers/SnackBarProvider';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

type SelectedLocation = {
  location: LocationEntity;
  index: number;
};

// A lot nothing describes shows no source at all
const SOURCE_LABELS: Record<LocationSource, string> = {
  'save': 'Custom',
  'generated': 'Written by AI',
  'online': 'Default',
  'built-in': 'Default',
  'stock': '',
};

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 250 },
  { field: 'lot_type', headerName: 'Lot Type', width: 150 },
  { field: 'neighborhood', headerName: 'Neighborhood', width: 260 },
  {
    field: 'source',
    headerName: 'Source',
    width: 210,
    valueGetter: (_value: never, row: LocationEntity) => SOURCE_LABELS[row.source ?? 'stock'],
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 2000,
  },
];

const client = new SentientSimsAppClient();

const HOW_TO = [
  'Visit the lot in game or add screenshots of it, then press Auto-Generate Description for a draft, or write your own.',
  'Write 3 to 4 sentences in the present tense: what the place is and where, the real things in it floor by floor (the bar, the pool, the stage), then what the place is like and who it is for.',
  'Leave out: people doing things (visitors, staff, she/he/you), names, anything happening right now, counts ("six computers"), lists of every object, and stock phrases like vibrant or nestled.',
];

// The repository's lot type for a lot nobody has typed one for
const PLACEHOLDER_LOT_TYPE = 'Residence';

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationEntity[]>([]);
  const [editedLocation, setEditedLocation] = useState<SelectedLocation | null | undefined>();
  const [namesFromSave, setNamesFromSave] = useState<string[]>([]);
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [writing, setWriting] = useState(false);
  // Screenshots belong to the lot they were added for: a new selection starts with none
  const [lotScreenshots, setLotScreenshots] = useState<{ id?: number; images: MessageImage[] }>({ images: [] });
  const editedId = editedLocation?.location.id;
  const screenshots = lotScreenshots.id === editedId ? lotScreenshots.images : [];
  const setScreenshots = (images: MessageImage[]) => {
    setLotScreenshots({ id: editedId, images });
  };
  const { status } = useWebsocket();
  const { userAttributes } = useAuth();
  const { showMessage } = useSnackBar();
  const isMapper = new PatreonUser(userAttributes).isMapper();

  function getLocations() {
    client.locations
      .getAllLocations()
      .then((allLocations) => {
        setLocations(allLocations);
        return allLocations;
      })
      .catch(() => {
        // ignore
      });
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeListener = window.electron.onLocationChanged((_event: any) => {
      // Reload location
      getLocations();
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    getLocations();
  }, []);

  useOnDatabaseLoaded(() => {
    getLocations();
  });

  useEffect(() => {
    const removeListener = window.electron.onDatabaseLoaded(() => {
      getLocations();
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onDatabaseUnloaded(() => {
      setLocations([]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleSetSelectedLocation = useCallback(
    (index: number) => {
      if (index < 0) {
        setEditedLocation(null);
      } else {
        setEditedLocation({
          location: locations[index],
          index,
        });
      }
    },
    [locations],
  );

  async function handleSave() {
    const shown = editedLocation ? locations[editedLocation.index] : undefined;
    const changed =
      !shown ||
      shown.name !== editedLocation?.location.name ||
      shown.lot_type !== editedLocation.location.lot_type ||
      shown.description !== editedLocation.location.description;
    // Saving a default untouched would copy it into the save and stop it following the default
    if (editedLocation && changed) {
      log.debug(`Edited Location: ${JSON.stringify(editedLocation.location)}`);

      try {
        await client.locations.updateLocation(editedLocation.location);
      } catch (error) {
        log.error('Error saving updated location', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedLocation(-1);
    getLocations();
  }

  // With this save's row gone the location resolves to its default (or, with none, to the
  // stock text): the same call is "Restore to Default" and "Delete"
  const handleDelete = useCallback(async () => {
    if (editedLocation) {
      try {
        await client.locations.deleteLocation(editedLocation.location.id);
      } catch (error) {
        log.error('Deletion of location failed', error);
        if (error instanceof Error && error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedLocation(-1);
    getLocations();
  }, [editedLocation, handleSetSelectedLocation]);

  async function handlePublish(force = false) {
    if (!editedLocation) {
      return;
    }
    setPublishing(true);
    try {
      const names = await client.locations.publishLocation(editedLocation.location, force);
      if (names.length > 0) {
        // Nothing was published: show who, and let it through only on a second press
        setNamesFromSave(names);
        setPublishing(false);
        return;
      }
      showMessage(`Default saved for everyone: ${editedLocation.location.name}`, 'success');
      handleSetSelectedLocation(-1);
      getLocations();
    } catch (error) {
      showMessage(`Failed to save the default: ${editedLocation.location.name}`, 'error');
      log.error('Publishing location failed', error);
    }
    setPublishing(false);
  }

  async function handleUnpublish() {
    if (!editedLocation) {
      return;
    }
    setPublishing(true);
    try {
      await client.locations.unpublishLocation(editedLocation.location.id);
      showMessage(`Default removed for everyone: ${editedLocation.location.name}`, 'success');
      handleSetSelectedLocation(-1);
      getLocations();
    } catch (error) {
      showMessage(`Failed to remove the default: ${editedLocation.location.name}`, 'error');
      log.error('Removing shared location failed', error);
    }
    setPublishing(false);
  }

  // A draft from what the game reported about the lot, into the editor: Save keeps it as this
  // save's own text, Save as Default for Everyone publishes it. Nothing happens on its own.
  // The game's lot type fills Lot Type unless the player already typed one of their own.
  async function handleAutoGenerate() {
    if (!editedLocation) {
      return;
    }
    setWriting(true);
    try {
      const written = await client.locations.describeLocation(editedLocation.location.id, screenshots);
      if ('error' in written) {
        showMessage(written.error, 'warning');
      } else {
        setEditedLocation((previousLocation) => {
          if (!previousLocation) {
            return previousLocation;
          }
          const current = previousLocation.location.lot_type.trim();
          const lotType = written.lotType && (!current || current === PLACEHOLDER_LOT_TYPE) ? written.lotType : current;
          return {
            ...previousLocation,
            location: { ...previousLocation.location, description: written.description, lot_type: lotType },
          };
        });
      }
    } catch (error) {
      showMessage(`Could not write a description for ${editedLocation.location.name}`, 'error');
      log.error('Writing a location description failed', error);
    }
    setWriting(false);
  }

  const handleNameEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedLocation((previousLocation) =>
      previousLocation
        ? { ...previousLocation, location: { ...previousLocation.location, name: event.target.value } }
        : previousLocation,
    );
  }, []);

  const handleLotTypeEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedLocation((previousLocation) =>
      previousLocation
        ? { ...previousLocation, location: { ...previousLocation.location, lot_type: event.target.value } }
        : previousLocation,
    );
  }, []);

  const handleDescriptionEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedLocation((previousLocation) =>
      previousLocation
        ? { ...previousLocation, location: { ...previousLocation.location, description: event.target.value } }
        : previousLocation,
    );
  }, []);

  if (!status.mod || locations.length === 0) {
    return (
      <EmptyState
        icon={<SportsEsportsOutlinedIcon />}
        title="Not connected to The Sims 4"
        description="Start a Sims 4 game to connect and manage locations here."
      />
    );
  }

  let editLocationBox;

  if (editedLocation) {
    const { location } = editedLocation;
    const ownText = location.source === 'save' || location.source === 'generated';
    const fallback = location.default;
    const differsFromDefault = !!fallback && fallback.description !== location.description;

    editLocationBox = (
      <AppCard
        title="Edit Location"
        icon={<EditNoteIcon fontSize="small" />}
        cardActions={
          <CardActions
            sx={{
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              marginLeft: 1,
              marginRight: 1,
              marginBottom: 1,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
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
                  handleSetSelectedLocation(-1);
                }}
              >
                Cancel
              </Button>
              <Tooltip
                title="Drafts a description from what the game reports about this lot, and from any screenshots you added."
                placement="top"
              >
                <span>
                  <Button
                    loading={writing}
                    variant="outlined"
                    startIcon={<AutoAwesomeOutlinedIcon />}
                    onClick={() => {
                      void handleAutoGenerate();
                    }}
                  >
                    Auto-Generate Description
                  </Button>
                </span>
              </Tooltip>
              {isMapper && (
                <Tooltip
                  title="Sets the default description every player gets. Players who wrote their own keep it."
                  placement="top"
                >
                  <span>
                    <Button
                      loading={publishing}
                      variant="outlined"
                      color="warning"
                      startIcon={<CloudUploadOutlinedIcon />}
                      onClick={() => {
                        void handlePublish();
                      }}
                    >
                      Save as Default for Everyone
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {isMapper && fallback?.source === 'online' && (
                <Button
                  loading={publishing}
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => {
                    setConfirmingUnpublish(true);
                  }}
                >
                  Remove Default for Everyone
                </Button>
              )}
              {ownText && fallback && (
                <Tooltip title="Replaces your description with the default one" placement="top">
                  <Button
                    color="primary"
                    variant="outlined"
                    startIcon={<RestoreOutlinedIcon />}
                    onClick={() => {
                      void handleDelete();
                    }}
                  >
                    Restore to Default
                  </Button>
                </Tooltip>
              )}
              {ownText && !fallback && (
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    void handleDelete();
                  }}
                >
                  Delete
                </Button>
              )}
            </Box>
          </CardActions>
        }
      >
        <LotScreenshots screenshots={screenshots} onChange={setScreenshots}>
          <MemoryEditInput label="Name" rows={1} handleEdit={handleNameEdit} forceShow value={location.name} />
          <MemoryEditInput
            label="Lot Type"
            rows={1}
            handleEdit={handleLotTypeEdit}
            forceShow
            value={location.lot_type}
          />
          <MemoryEditInput
            label="Description"
            handleEdit={handleDescriptionEdit}
            rows={5}
            forceShow
            value={location.description}
          />
          {location.neighborhood && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Neighborhood: {location.neighborhood}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              3 to 4 sentences: what the place is and where, then the real things in it. No people, no names.
            </Typography>
            <Tooltip
              placement="top"
              title={
                <Box>
                  {HOW_TO.map((line) => (
                    <Typography key={line} variant="body2" sx={{ mb: 0.5 }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              }
            >
              <InfoOutlinedIcon fontSize="small" color="action" aria-label="How to write a lot description" />
            </Tooltip>
          </Box>
        </LotScreenshots>
        {ownText && fallback && differsFromDefault && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Default description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {fallback.description}
            </Typography>
          </Box>
        )}
      </AppCard>
    );
  }

  return (
    <div>
      <Card
        sx={{
          minWidth: 275,
          maxHeight: editedLocation ? 400 : 700,
          marginBottom: 2,
          overflow: 'auto',
        }}
      >
        <CardContent>
          <div style={{ height: editedLocation ? 315 : 700, width: '100%' }}>
            <DataGrid
              rows={locations}
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
                  for (let i = 0; i < locations.length; i++) {
                    const location = locations[i];
                    if (location.id === selectedId) {
                      setEditedLocation({
                        location,
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
      {editLocationBox}
      <Dialog
        open={namesFromSave.length > 0}
        onClose={() => {
          setNamesFromSave([]);
        }}
      >
        <DialogTitle>This text names somebody in your save</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {namesFromSave.length === 1
              ? `"${namesFromSave[0]}" is a name from your save.`
              : `${namesFromSave.map((name) => `"${name}"`).join(', ')} are names from your save.`}{' '}
            A default description goes to everyone who uses the mod, and nobody else has a sim by that name.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Nothing has been published. Take the name out and save again, or publish anyway if the word really is meant
            to be there.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setNamesFromSave([]);
            }}
          >
            Let me fix it
          </Button>
          <Button
            color="warning"
            loading={publishing}
            onClick={() => {
              setNamesFromSave([]);
              void handlePublish(true);
            }}
          >
            Publish anyway
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmingUnpublish}
        onClose={() => {
          setConfirmingUnpublish(false);
        }}
      >
        <DialogTitle>Remove this default for everyone?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Every player without their own description goes back to the built-in one, or to the generic text if there is
            none.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmingUnpublish(false);
            }}
          >
            Keep it
          </Button>
          <Button
            color="error"
            onClick={() => {
              setConfirmingUnpublish(false);
              void handleUnpublish();
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
