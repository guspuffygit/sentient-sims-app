import { useEffect, useRef, useState } from 'react';
import { Box, Button, FormHelperText, Link, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { VoiceClient } from 'main/sentient-sims/clients/VoiceClient';
import { appApiUrl } from 'main/sentient-sims/constants';
import APIKeyInput from 'renderer/APIKeyInput';
import useSetting from 'renderer/hooks/useSetting';

const elevenLabsApiKeysUrl = 'https://elevenlabs.io/app/settings/api-keys';
const elevenLabsPricingUrl = 'https://elevenlabs.io/pricing';

const voiceClient = new VoiceClient(appApiUrl);

type ElevenLabsKeySetupProps = {
  // Hears whether the key as typed has passed a check
  onCheckedChange?: (ok: boolean) => void;

  // Checks a saved key once on open
  autoCheck?: boolean;
};

// The ElevenLabs key: where to get one, step by step, the key field, and a check
// that loads the account's voices with it. ElevenLabs' own error is shown as
// theirs, so a plan limit is never read as a Sentient Sims membership rule.
// A result counts only for the key it checked.
export function ElevenLabsKeySetup({ onCheckedChange, autoCheck = false }: ElevenLabsKeySetupProps) {
  const elevenlabsKeySetting = useSetting<string>(SettingsEnum.ELEVENLABS_KEY, '');
  const key = elevenlabsKeySetting.value.trim();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ key: string; ok: boolean; message: string }>();
  const current = result?.key === key ? result : undefined;
  const ok = current?.ok === true;

  const checkKey = async () => {
    const checked = key;
    setChecking(true);
    setResult(undefined);
    try {
      const cache = await voiceClient.refreshElevenLabsVoices();
      setResult({
        key: checked,
        ok: true,
        message: `Key works. Found ${cache.voices.length} voices on your ElevenLabs account.`,
      });
    } catch (err) {
      setResult({
        key: checked,
        ok: false,
        message: `ElevenLabs says: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setChecking(false);
    }
  };

  const onCheckedChangeRef = useRef(onCheckedChange);
  useEffect(() => {
    onCheckedChangeRef.current = onCheckedChange;
  });
  useEffect(() => {
    onCheckedChangeRef.current?.(ok);
  }, [ok]);

  const autoCheckedRef = useRef(false);
  useEffect(() => {
    if (!autoCheck || autoCheckedRef.current || elevenlabsKeySetting.isLoading || !key) {
      return;
    }
    autoCheckedRef.current = true;
    void checkKey();
  });

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 1 }}>
        ElevenLabs only lets paid plans (Creator or higher) use its voices in other apps.{' '}
        <Link href={elevenLabsPricingUrl} target="_blank" rel="noopener noreferrer">
          ElevenLabs plans
        </Link>
      </Typography>
      <List sx={{ listStyle: 'decimal', pl: 2.5, marginBottom: 1 }} dense disablePadding>
        <ListItem sx={{ display: 'list-item' }} disablePadding>
          <ListItemText>
            Open{' '}
            <Link href={elevenLabsApiKeysUrl} target="_blank" rel="noopener noreferrer">
              your ElevenLabs API keys
            </Link>{' '}
            and click Create Key.
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }} disablePadding>
          <ListItemText>
            Under permissions, give Text to Speech access, and set Voices and Voice Generation to Read.
          </ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }} disablePadding>
          <ListItemText>Click Create Key.</ListItemText>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }} disablePadding>
          <ListItemText>
            Copy the API key itself, the long secret ElevenLabs shows once. Do not copy the Key ID. Paste it here:
          </ListItemText>
        </ListItem>
      </List>
      <APIKeyInput setting={elevenlabsKeySetting} aiName="ElevenLabs" />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', marginTop: 1 }}>
        <Button size="small" variant="outlined" loading={checking} disabled={!key} onClick={() => void checkKey()}>
          Check key
        </Button>
        {ok ? <CheckCircleOutlineIcon sx={{ color: 'success.main' }} fontSize="small" /> : null}
      </Stack>
      {current ? (
        <FormHelperText error={!current.ok} sx={{ color: current.ok ? 'success.main' : undefined }}>
          {current.message}
        </FormHelperText>
      ) : null}
    </Box>
  );
}
