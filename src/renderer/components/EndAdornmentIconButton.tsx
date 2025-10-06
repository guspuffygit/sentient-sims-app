import { IconButton, IconButtonProps } from '@mui/material';
import * as React from 'react';

interface EndAdornmentIconButtonProps extends IconButtonProps {
  style?: React.CSSProperties;
}

export function EndAdornmentIconButton(props: EndAdornmentIconButtonProps) {
  return (
    <IconButton
      {...props}
      style={{
        maxWidth: '30px',
        maxHeight: '30px',
        minWidth: '30px',
        minHeight: '30px',
        ...props?.style,
      }}
    />
  );
}
