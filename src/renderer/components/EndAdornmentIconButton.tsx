/* eslint-disable react/jsx-props-no-spreading */
import { IconButton, IconButtonProps } from '@mui/material';
import * as React from 'react';

interface EndAdornmentIconButtonProps extends IconButtonProps {
  // eslint-disable-next-line react/require-default-props
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
