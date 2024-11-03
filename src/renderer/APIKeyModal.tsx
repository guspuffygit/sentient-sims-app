import React, { useEffect, useState } from 'react';
import { Button, FormHelperText, InputAdornment } from '@mui/material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
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
  const [keyVisibility, setKeyVisibility] = useState(false);

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
    if (status.status) {
      await apiKeySetting.setSetting(apiKey);
      onClose();
    } else {
      setErrorMessage(`Key not working: ${status?.error}`);
    }
  }

  function onApiKeyPasteFromClipboard(_event: any, text: string) {
    if (text.trim()) {
      setAPIKey(text.trim());
    }
  }

  useEffect(() => {
    const removeListener = window.electron.onApiKeyPasteFromClipboard(
      onApiKeyPasteFromClipboard
    );

    return () => {
      removeListener();
    };
  }, []);

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
            type={keyVisibility ? 'text' : 'password'}
            label={label}
            value={apiKey}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    style={{
                      maxWidth: '30px',
                      maxHeight: '30px',
                      minWidth: '30px',
                      minHeight: '30px',
                      paddingRight: 10,
                      paddingLeft: 10,
                    }}
                    onClick={() => setKeyVisibility(!keyVisibility)}
                  >
                    {keyVisibility ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </Button>
                  <Button
                    style={{
                      maxWidth: '30px',
                      maxHeight: '30px',
                      minWidth: '30px',
                      minHeight: '30px',
                    }}
                    onClick={() => window.electron.apiKeyPasteButtonClick()}
                  >
                    <ContentPasteIcon />
                  </Button>
                </InputAdornment>
              ),
            }}
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
