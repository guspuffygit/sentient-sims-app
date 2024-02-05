import React, { useEffect, useState } from 'react';
import { FormHelperText } from '@mui/material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from './hooks/useSetting';
import useApiKeyAITest from './hooks/useOpenAITest';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  setting: SettingsEnum;
  aiName: string;
}

export default function APIKeyModal({
  open,
  onClose,
  setting,
  aiName,
}: ModalProps) {
  const [apiKey, setAPIKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const { aiStatus, testAI } = useApiKeyAITest();
  const apiKeySetting = useSetting(setting, '');

  useEffect(() => {
    setAPIKey(apiKeySetting.value);
  }, [apiKeySetting.value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAPIKey(event.target.value);
  };
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    const status = await testAI(apiKey);
    if (status === 'OK') {
      await apiKeySetting.setSetting(apiKey);
      onClose();
    } else {
      setErrorMessage(`Key not working`);
    }
  }

  const label = `${aiName} AI Key`;

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
            label={label}
            value={apiKey}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <LoadingButton
            loading={aiStatus.loading}
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
