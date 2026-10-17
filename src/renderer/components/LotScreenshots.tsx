import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { ChangeEvent, ClipboardEvent, ReactNode, useRef } from 'react';
import log from 'electron-log';
import { MessageImage } from 'main/sentient-sims/models/OpenAIMessage';

export const MAX_LOT_SCREENSHOTS = 4;

// Big enough to read a room, small enough that four of them stay a cheap request
const MAX_SIDE = 1568;
const JPEG_QUALITY = 0.85;

async function shrink(file: Blob): Promise<MessageImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return { mimeType: 'image/jpeg', data: dataUrl.slice(dataUrl.indexOf(',') + 1) };
}

type LotScreenshotsProps = {
  screenshots: MessageImage[];
  onChange: (screenshots: MessageImage[]) => void;
  children: ReactNode;
};

/**
 * Screenshots of a lot for Auto-Generate Description: picked from disk or pasted (Ctrl+V
 * anywhere inside, so a Win+Shift+S snip goes straight in). Wraps the editor it serves.
 */
export function LotScreenshots({ screenshots, onChange, children }: LotScreenshotsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function add(files: Blob[]) {
    const room = MAX_LOT_SCREENSHOTS - screenshots.length;
    if (room <= 0 || files.length === 0) {
      return;
    }
    try {
      const shrunk = await Promise.all(files.slice(0, room).map((file) => shrink(file)));
      onChange([...screenshots, ...shrunk]);
    } catch (error) {
      log.error('Reading a lot screenshot failed', error);
    }
  }

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    void add(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const images = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (images.length > 0) {
      event.preventDefault();
      void add(images);
    }
  }

  return (
    <Box onPaste={handlePaste}>
      {children}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <Tooltip
          placement="top"
          title="Up to 4 pictures of the lot (outside, each floor) for Auto-Generate Description. Pick files, or paste one with Ctrl+V. Game screenshots (the C key) are in Documents\Electronic Arts\The Sims 4\Screenshots. Needs OpenAI, Gemini or OpenRouter as the Default Description AI."
        >
          <span>
            <Button
              size="small"
              variant="text"
              startIcon={<AddPhotoAlternateOutlinedIcon />}
              disabled={screenshots.length >= MAX_LOT_SCREENSHOTS}
              onClick={() => inputRef.current?.click()}
            >
              Add Screenshots
            </Button>
          </span>
        </Tooltip>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handlePick} />
        {screenshots.map((screenshot, index) => (
          <Box key={screenshot.data.slice(-32)} sx={{ position: 'relative' }}>
            <img
              src={`data:${screenshot.mimeType};base64,${screenshot.data}`}
              alt={`Screenshot ${index + 1}`}
              style={{ height: 56, borderRadius: 4, display: 'block' }}
            />
            <IconButton
              size="small"
              aria-label="Remove screenshot"
              onClick={() => {
                onChange(screenshots.filter((_, other) => other !== index));
              }}
              sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', p: 0.25 }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        ))}
        {screenshots.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {screenshots.length} of {MAX_LOT_SCREENSHOTS}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
