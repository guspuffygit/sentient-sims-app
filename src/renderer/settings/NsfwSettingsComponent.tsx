import {
  Box,
  FormControlLabel,
  Checkbox,
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ChangeEvent, useState } from 'react';
import useSetting from '../hooks/useSetting';

export default function NsfwSettingsComponent() {
  const [open, setOpen] = useState(false);
  const customLLMEnabled = useSetting(SettingsEnum.CUSTOM_LLM_ENABLED, false);
  const nsfwEnabled = useSetting(SettingsEnum.NSFW_ENABLED, false);

  if (customLLMEnabled.value) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  const onChange = (change: ChangeEvent<HTMLInputElement>) => {
    if (change.target.checked) {
      setOpen(true);
    } else {
      nsfwEnabled.setSetting(false);
    }
  };

  const onConfirm = () => {
    nsfwEnabled.setSetting(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <FormControlLabel
          label="Force Enable NSFW"
          control={<Checkbox checked={nsfwEnabled.value} onChange={onChange} />}
        />
      </Box>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>OpenAI Content Policy Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enabling this feature will violate OpenAI content policy and will
            most likely produce censored results.
          </DialogContentText>
          <DialogContentText>
            In the worst case scenario your account could be banned.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Enable, I Understand My OpenAI Account Could Be Banned
          </Button>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
