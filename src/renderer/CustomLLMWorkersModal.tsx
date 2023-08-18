import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LLMWorker } from 'main/sentient-sims/models/LLMWorker';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  workers: LLMWorker[];
}

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 450 },
  {
    field: 'type',
    headerName: 'Type',
    width: 250,
  },
  {
    field: 'model',
    headerName: 'Model',
    width: 300,
  },
];

export default function CustomLLMWorkersModal({
  open,
  onClose,
  workers,
}: ModalProps) {
  const rows: any[] = [];
  workers.forEach((worker, index) => {
    rows.push({
      id: index,
      name: worker.name,
      type: worker.type,
      model: worker.model,
    });
  });
  // const rows = JSON.parse(JSON.stringify(workers));
  return (
    <Modal open={open} onClose={onClose}>
      <Box
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
        <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
      </Box>
    </Modal>
  );
}
