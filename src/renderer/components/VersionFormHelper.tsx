import { FormHelperText } from '@mui/material';
import { Version } from 'main/sentient-sims/services/VersionService';
import { JSX } from 'react';

export type VersionFormHelperProps = {
  text: string;
  version: Version;
};

export function VersionFormHelper({ text, version }: VersionFormHelperProps) {
  if (version?.error) {
    const errors = version?.error.split('\n');
    const elements: JSX.Element[] = [];
    for (let i = 0; i < errors.length; i += 1) {
      if (i === 0) {
        elements.push(
          <FormHelperText error>
            {text}: {errors[i]}
          </FormHelperText>,
        );
      } else {
        elements.push(<FormHelperText error>{errors[i]}</FormHelperText>);
      }
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{elements}</>;
  }

  return (
    <FormHelperText>
      {text}: {version.version}
    </FormHelperText>
  );
}
