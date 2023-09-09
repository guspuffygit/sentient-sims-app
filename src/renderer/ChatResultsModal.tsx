import { useState } from 'react';
import { Box, Divider, Modal, Typography } from '@mui/material';

export type ChatResultsState = {
  open: boolean;
  results: string[];
};

export default function ChatResultsModal() {
  const [state, setState] = useState<ChatResultsState>({
    open: false,
    results: [],
  });

  const onClose = () => {
    setState({
      open: false,
      results: [],
    });
  };

  return {
    setResults: setState,
    resultsModal: (
      <Modal open={state.open} onClose={onClose}>
        <Box
          height={650}
          overflow="auto"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          {state.results.map((value, index) => {
            if (index + 1 !== state.results.length) {
              return (
                <>
                  <Typography>{value}</Typography>
                  <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                </>
              );
            }

            return <Typography>{value}</Typography>;
          })}
        </Box>
      </Modal>
    ),
  };
}
