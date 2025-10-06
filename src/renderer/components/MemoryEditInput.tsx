import { Box, TextField } from '@mui/material';
import { ChangeEvent } from 'react';

export type MemoryEditInputProperties = {
  rows?: number;
  value?: string;
  label: string;
  handleEdit: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  forceShow?: boolean;
};

export function MemoryEditInput({ rows, value, label, handleEdit, forceShow = false }: MemoryEditInputProperties) {
  if (!value && !forceShow) {
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
      />
    </Box>
  );
}

MemoryEditInput.defaultProps = {
  rows: 2,
  value: undefined,
};
