import React, { useCallback, useEffect, useState } from 'react';
import { InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { SettingsHook } from './hooks/useSetting';
import { EndAdornmentIconButton } from './components/EndAdornmentIconButton';
import { EndAdornmentTooltip } from './components/EndAdornmentTooltip';

interface ModalProps {
  setting: SettingsHook<string>;
  aiName: string;
}

export default function APIKeyInput({ setting, aiName }: ModalProps) {
  const [keyVisibility, setKeyVisibility] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setting.setSetting(event.target.value);
  };

  const onApiPasteCallback = useCallback(
    function onApiKeyPasteFromClipboard(_event: any, text: string) {
      const pastedText = text.trim();
      if (pastedText) {
        setting.setSetting(pastedText);
      }
    },
    [setting]
  );

  useEffect(() => {
    const removeListener =
      window.electron.onApiKeyPasteFromClipboard(onApiPasteCallback);

    return () => {
      removeListener();
    };
  }, [onApiPasteCallback]);

  const label = `${aiName} Key`;

  return (
    <TextField
      type={keyVisibility ? 'text' : 'password'}
      label={label}
      value={setting.value}
      onChange={handleInputChange}
      size="small"
      fullWidth
      required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <EndAdornmentTooltip title="Toggle Visibility">
              <EndAdornmentIconButton
                style={{
                  paddingRight: 10,
                  paddingLeft: 10,
                }}
                onClick={() => setKeyVisibility(!keyVisibility)}
              >
                {keyVisibility ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </EndAdornmentIconButton>
            </EndAdornmentTooltip>
            <EndAdornmentTooltip title="Paste from clipboard">
              <EndAdornmentIconButton
                onClick={() => window.electron.apiKeyPasteButtonClick()}
              >
                <ContentPasteIcon />
              </EndAdornmentIconButton>
            </EndAdornmentTooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}
