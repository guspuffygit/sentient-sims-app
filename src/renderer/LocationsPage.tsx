/* eslint-disable promise/always-return */
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { appApiUrl } from 'main/sentient-sims/constants';
import { ListScreenshotsResponse } from 'main/sentient-sims/models/ListScreenshotsResponse';
import AIIcon from '@mui/icons-material/AutoAwesome';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';
import { BlankDataGridFooterComponent } from './components/BlankDataGridFooter';
import { useOnDatabaseLoaded } from './hooks/useOnDatabaseLoaded';
import { useWebsocket } from './providers/WebsocketProvider';
import { useAIVision } from './components/AIVisionModal';

type SelectedLocation = {
  location: LocationEntity;
  index: number;
};

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 70, hideable: true },
  { field: 'name', headerName: 'Name', width: 250 },
  { field: 'lot_type', headerName: 'Lot Type', width: 150 },
  { field: 'is_default', headerName: 'Default', width: 100 },
  {
    field: 'description',
    headerName: 'Description',
    width: 2000,
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationEntity[]>([]);
  const [editedLocation, setEditedLocation] = useState<SelectedLocation | null | undefined>();
  const { status } = useWebsocket();
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const aiVision = useAIVision();

  function getLocations() {
    fetch(`${appApiUrl}/locations`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((locationsResponse: LocationEntity[]) => {
        setLocations(locationsResponse);
      })
      .catch(() => {
        // ignore
      });
  }

  function getScreenshots() {
    fetch(`${appApiUrl}/files/screenshots`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((screenshotsResponse: ListScreenshotsResponse) => {
        setScreenshots(
          screenshotsResponse.data.map((screenshot) => screenshot.name)
        );
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
    getScreenshots();
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
    if (editedLocation) {
      log.debug(`Edited Location: ${JSON.stringify(editedLocation.location)}`);

      try {
        const url = `${appApiUrl}/locations`;

        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedLocation.location),
        });

        setLocations((previousLocations) => {
          const newLocations = [...previousLocations];
          newLocations[editedLocation.index] = editedLocation.location;
          return newLocations;
        });
      } catch (error: any) {
        log.error('Error saving updated location', error);
        if (error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedLocation(-1);
  }

  const handleDelete = useCallback(async () => {
    if (editedLocation) {
      try {
        log.info(`Deleting Location: ${editedLocation.location.id}`);
        await fetch(`${appApiUrl}/locations/${editedLocation.location.id}`, {
          method: 'DELETE',
        });
      } catch (error: any) {
        log.error('Deletion of location failed', error);
        if (error.cause) {
          log.error(error.cause);
        }
      }
    }

    handleSetSelectedLocation(-1);
    getLocations();
  }, [editedLocation, handleSetSelectedLocation]);

  const handleNameEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedLocation((previousLocation) => ({
      index: Number(previousLocation?.index),
      location: {
        id: Number(previousLocation?.location?.id),
        name: event.target.value,
        lot_type: previousLocation?.location?.lot_type || '',
        description: previousLocation?.location?.description || '',
      },
    }));
  }, []);

  const handleLotTypeEdit = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedLocation((previousLocation) => ({
      index: Number(previousLocation?.index),
      location: {
        id: Number(previousLocation?.location?.id),
        name: previousLocation?.location?.name || '',
        lot_type: event.target.value,
        description: previousLocation?.location?.description || '',
      },
    }));
  }, []);

  const handleDescriptionEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedLocation((previousLocation) => ({
        index: Number(previousLocation?.index),
        location: {
          id: Number(previousLocation?.location?.id),
          name: previousLocation?.location?.name || '',
          lot_type: previousLocation?.location?.lot_type || '',
          description: event.target.value,
        },
      }));
    },
    []
  );
  if (locations.length > 0) {
    if (editedLocation) {
      return (
        <div>
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
                    sx={{ marginRight: 1 }}
                    color="secondary"
                    variant="outlined"
                    onClick={() => handleSetSelectedLocation(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={() => aiVision.openModal()}
                  >
                    <AIIcon sx={{ marginRight: 1 }} /> AI Vision
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
              label="Name"
              rows={1}
              handleEdit={handleNameEdit}
              forceShow
              value={editedLocation?.location?.name}
            />
            <MemoryEditInput
              label="Lot Type"
              rows={1}
              handleEdit={handleLotTypeEdit}
              forceShow
              value={editedLocation?.location?.lot_type}
            />
            <MemoryEditInput
              label="Description"
              handleEdit={handleDescriptionEdit}
              rows={5}
              forceShow
              value={editedLocation?.location?.description}
            />
          </AppCard>
          {aiVision.modal}
        </div>
      );
    }

    return (
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
              slots={{
                footer: BlankDataGridFooterComponent,
              }}
              onRowSelectionModelChange={(selectedRow) => {
                try {
                  for (let i = 0; i < locations.length; i++) {
                    const location = locations[i];
                    if (location.id === selectedRow[0]) {
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
    );
  }

  return (
    <Card sx={{ minWidth: 275, marginBottom: 2, overflowY: 'scroll' }}>
      <Box sx={{ margin: 2 }}>
        <ImageList
          sx={{ minWidth: 275, height: 450 }}
          variant="woven"
          cols={5}
          gap={8}
        >
          {screenshots.map((item) => (
            <ImageListItem key={item}>
              <img
                srcSet={`${appApiUrl}/files/screenshots/${item}?w=161&fit=crop&auto=format&dpr=2 2x`}
                src={`${appApiUrl}/files/screenshots/${item}?w=161&fit=crop&auto=format`}
                alt={item}
                loading="lazy"
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    </Card>
  );
}
