import { Button } from '@mui/material';
import { Box, styled } from '@mui/system';
import { AssetsImage } from './AssetsImage';

const GoogleButton = styled(Button)(() => ({
  'textTransform': 'none',
  '-moz-user-select': 'none',
  '-webkit-user-select': 'none',
  '-ms-user-select': 'none',
  'backgroundColor': 'white',
  'border': '1px solid #747775',
  'borderRadius': 4,
  'boxSizing': 'border-box',
  'color': '#1f1f1f',
  'cursor': 'pointer',
  'fontFamily': 'Roboto, arial, sans-serif',
  'fontSize': 14,
  'height': 40,
  'letterSpacing': '0.25px',
  'outline': 'none',
  'overflow': 'hidden',
  'padding': '0 12px',
  'position': 'relative',
  'textAlign': 'center',
  'transition': 'background-color .218s, border-color .218s, box-shadow .218s',
  'verticalAlign': 'middle',
  'whiteSpace': 'nowrap',
  'width': 'auto',
  'maxWidth': 400,
  'minWidth': 'min-content',
  '&:hover': {
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
  },
  '&:disabled': {
    'cursor': 'default',
    'backgroundColor': '#ffffff61',
    'borderColor': '#1f1f1f1f',
    '& .MuiButton-startIcon, & span': { opacity: 0.38 },
  },
  '& .MuiButton-startIcon': {
    height: 20,
    marginRight: 12,
    minWidth: 20,
    width: 20,
  },
  '& span': {
    flexGrow: 1,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'top',
  },
}));

export type GoogleLoginButtonProps = {
  onClick: () => void;
};

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 3 }}>
      <GoogleButton startIcon={<AssetsImage name="google-logo.png" width={25} height={25} />} onClick={onClick}>
        Sign in with Google
      </GoogleButton>
    </Box>
  );
}
