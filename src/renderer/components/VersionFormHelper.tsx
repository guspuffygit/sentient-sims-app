import { FormHelperText, Tooltip } from '@mui/material';
import { Version } from 'main/sentient-sims/services/VersionService';

export type VersionFormHelperProps = {
  text: string;
  version: Version;
};

// A missing version is normal before setup (no mod installed yet), so it reads
// as "not found" with the details on hover rather than as an error
export function VersionFormHelper({ text, version }: VersionFormHelperProps) {
  if (version.error) {
    return (
      <Tooltip title={version.error} placement="bottom-start">
        <FormHelperText sx={{ cursor: 'help' }}>{text}: not found</FormHelperText>
      </Tooltip>
    );
  }

  return (
    <FormHelperText>
      {text}: {version.version}
    </FormHelperText>
  );
}
