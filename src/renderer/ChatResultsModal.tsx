import { useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';

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
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(1000px, 92vw)',
            height: 650,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
            padding: 3,
          }}
        >
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="h6">Generation Results</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`${state.results.length} response${state.results.length === 1 ? '' : 's'} generated from the same prompt`}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', paddingRight: 0.5 }}>
            {state.results.map((value, index) => {
              const key = `${index}-${value}`;
              return (
                <Box
                  key={key}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.default',
                    padding: 1.5,
                    marginBottom: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.light', fontWeight: 700, letterSpacing: '0.04em' }}
                  >
                    {`Response ${index + 1}`}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', marginTop: 0.5 }}>
                    {value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Modal>
    ),
  };
}
