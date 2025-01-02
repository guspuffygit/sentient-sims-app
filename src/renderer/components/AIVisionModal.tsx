/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import { LoadingButton } from '@mui/lab';
import { Box, ImageList, ImageListItem, Modal, styled } from '@mui/material';
import { useState, JSX } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import { ListScreenshotsResponse } from 'main/sentient-sims/models/ListScreenshotsResponse';

export type AIVisionModalHook = {
  modal: JSX.Element;
  openModal: () => void;
};

const ImageListItemWithStyle = styled(ImageListItem)<{ isSelected: boolean }>(
  ({ theme, isSelected }) => ({
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.8,
      border: `solid 2px red`,
    },
    border: isSelected ? 'solid 2px green' : 'none',
  })
);

export function useAIVision(): AIVisionModalHook {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<string[]>([]);

  function handleClose() {
    setOpen(false);
  }

  function getScreenshots() {
    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function openModal() {
    setOpen(true);
    getScreenshots();
  }

  const modal = (
    <Modal open={open} onClose={() => handleClose()}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          overflowY: 'scroll',
          p: 4,
        }}
      >
        <Box sx={{ margin: 2 }}>
          <ImageList
            sx={{ midWidth: 500, minheight: 500 }}
            rowHeight={164}
            // variant="woven"
            cols={5}
            gap={8}
          >
            {screenshots.map((item) => (
              <ImageListItemWithStyle key={item} cols={1} >
                <img
                  srcSet={`${appApiUrl}/files/screenshots/${item}?w=161&fit=crop&auto=format&dpr=2 2x`}
                  src={`${appApiUrl}/files/screenshots/${item}?w=161&fit=crop&auto=format`}
                  alt={item}
                  loading="lazy"
                />
              </ImageListItemWithStyle>
            ))}
          </ImageList>
        </Box>
      </Box>
    </Modal>
  );

  return {
    openModal,
    modal,
  };
}
