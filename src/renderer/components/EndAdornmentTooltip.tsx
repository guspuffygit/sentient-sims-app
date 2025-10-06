import { Tooltip, TooltipProps } from '@mui/material';

export function EndAdornmentTooltip(props: TooltipProps) {
  return (
    <Tooltip {...props}>
      <div>{props?.children}</div>
    </Tooltip>
  );
}
