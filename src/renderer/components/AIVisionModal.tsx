/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import {
  Box,
  Button,
  Grid,
  ImageList,
  ImageListItem,
  Modal,
  styled,
  Typography,
} from '@mui/material';
import { useState, JSX, ChangeEvent, useCallback } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import {
  ListScreenshotsResponse,
  Screenshot,
} from 'main/sentient-sims/models/ListScreenshotsResponse';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import SpaceBetweenDiv from './SpaceBetweenDiv';
import { MemoryEditInput } from './MemoryEditInput';

export type AIVisionModalHook = {
  modal: JSX.Element;
  openModal: () => void;
};

const ImageListItemWithStyle = styled(ImageListItem)<{ isSelected: boolean }>(
  ({ theme, isSelected }) => ({
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.8,
    },
    border: isSelected ? 'solid 3px blue' : 'none',
  })
);

type SelectedScreenshot = {
  name: string;
  description: string;
};

export function useAIVision(): AIVisionModalHook {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<SelectedScreenshot[]>(
    []
  );
  const [screenNumber, setScreenNumber] = useState<number>(0);

  function handleClose() {
    setOpen(false);
    setSelectedIndexes([]);
    setScreenNumber(0);
  }

  function getScreenshots() {
    setLoading(true);
    fetch(`${appApiUrl}/files/screenshots`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((screenshotsResponse: ListScreenshotsResponse) => {
        setScreenshots(screenshotsResponse.data);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function openModal() {
    setOpen(true);
    getScreenshots();
  }

  function handleItemSelect(screenshot: Screenshot) {
    if (
      selectedIndexes.filter((idk) => idk.name === screenshot.name).length > 0
    ) {
      setSelectedIndexes(
        selectedIndexes.filter(
          (selectedItem) => selectedItem.name !== screenshot.name
        )
      );
    } else if (selectedIndexes.length < 5) {
      setSelectedIndexes([
        ...selectedIndexes,
        { name: screenshot.name, description: '' },
      ]);
    }
  }

  function handleNext() {
    setScreenNumber(screenNumber + 1);
  }

  const handleDescriptionEdit = useCallback(
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number
    ) => {
      setSelectedIndexes((previousIndexes) => {
        previousIndexes[index].description = event.target.value;
        return previousIndexes;
      });
    },
    []
  );

  const page = () => {
    switch (screenNumber) {
      case 1:
        return (
          <ImageList
            sx={{ midWidth: 500, height: 500 }}
            rowHeight={164}
            // variant="woven"
            cols={selectedIndexes.length}
            gap={8}
          >
            {selectedIndexes.map((item, index) => (
              <ImageListItem key={item.name}>
                <img
                  srcSet={`${appApiUrl}/files/screenshots/${item.name}?w=161&fit=crop&auto=format&dpr=2 2x`}
                  src={`${appApiUrl}/files/screenshots/${item.name}?w=161&fit=crop&auto=format`}
                  alt={item.name}
                  loading="lazy"
                />
                <Box sx={{ marginTop: 2 }}>
                  <MemoryEditInput
                    label="Description"
                    handleEdit={(event) => handleDescriptionEdit(event, index)}
                    rows={7}
                    forceShow
                    value={item.description}
                  />
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
        );
      default:
        return (
          <ImageList
            sx={{ midWidth: 500, height: 500 }}
            rowHeight={164}
            // variant="woven"
            cols={5}
            gap={8}
          >
            {screenshots.map((item) => (
              <ImageListItemWithStyle
                key={item.name}
                cols={1}
                isSelected={
                  selectedIndexes.filter((i) => i.name === item.name).length > 0
                }
                onClick={() => handleItemSelect(item)}
              >
                <img
                  srcSet={`${appApiUrl}/files/screenshots/${item.name}?w=161&fit=crop&auto=format&dpr=2 2x`}
                  src={`${appApiUrl}/files/screenshots/${item.name}?w=161&fit=crop&auto=format`}
                  alt={item.name}
                  loading="lazy"
                />
              </ImageListItemWithStyle>
            ))}
          </ImageList>
        );
    }
  };

  const modal = (
    <Modal open={open} onClose={() => handleClose()}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1200,
          bgcolor: 'background.paper',
          boxShadow: 24,
          overflowY: 'scroll',
          p: 4,
        }}
      >
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={3}>
            <Typography variant="h4" component="h2">
              Select up to 5 screenshots:
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h5" component="h2">
              {selectedIndexes.length} / 5 Selected
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ margin: 2 }}>{page()}</Box>
        <SpaceBetweenDiv>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              if (screenNumber === 0) {
                handleClose();
              } else {
                setScreenNumber(screenNumber - 1);
              }
            }}
          >
            <KeyboardArrowLeft /> {screenNumber === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            sx={{ marginRight: 2 }}
            variant="outlined"
            disabled={selectedIndexes.length === 0}
            color="secondary"
            onClick={() => handleNext()}
          >
            Next <KeyboardArrowRight />
          </Button>
        </SpaceBetweenDiv>
      </Box>
    </Modal>
  );

  return {
    openModal,
    modal,
  };
}
