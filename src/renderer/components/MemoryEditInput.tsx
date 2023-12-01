import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ChangeEvent } from 'react';

export type MemoryEditInputProperties = {
  rows?: number;
  value?: string;
  label: string;
  handleEdit: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setSelectedMemory: (index: number) => void;
};

export function MemoryEditInput({
  rows,
  value,
  label,
  handleEdit,
  setSelectedMemory,
}: MemoryEditInputProperties) {
  if (!value) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center">
      <TextField
        id="outlined-basic"
        variant="outlined"
        multiline
        rows={rows}
        value={value}
        onChange={(event) => handleEdit(event)}
        size="small"
        label={label}
        fullWidth
        sx={{ height: '100%', marginBottom: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ alignItems: 'flex-end' }}>
              <IconButton onClick={() => setSelectedMemory(-1)}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

MemoryEditInput.defaultProps = {
  rows: 2,
  value: undefined,
};
