import React, { useEffect, useState } from 'react';
import { FormHelperText } from '@mui/material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from './hooks/useSetting';
import useOpenAITest from './hooks/useOpenAITest';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OpenAIKeyModal({ open, onClose }: ModalProps) {
  const [openAIKey, setOpenAIKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const { openAIStatus, testOpenAI } = useOpenAITest();
  const openAIKeySetting = useSetting(SettingsEnum.OPENAI_KEY, '');

  useEffect(() => {
    setOpenAIKey(openAIKeySetting.value);
  }, [openAIKeySetting.value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIKey(event.target.value);
  };
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    const status = await testOpenAI(openAIKey);
    if (status === 'OK') {
      await openAIKeySetting.setSetting(openAIKey);
      onClose();
    } else {
      setErrorMessage(`Key not working`);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <form onSubmit={handleSubmit}>
          {errorMessage ? (
            <FormHelperText error sx={{ mb: 2 }}>
              {errorMessage}
            </FormHelperText>
          ) : null}
          <TextField
            type="password"
            label="Open AI Key"
            value={openAIKey}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <LoadingButton
            loading={openAIStatus.loading}
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Submit
          </LoadingButton>
        </form>
      </Box>
    </Modal>
  );
}
