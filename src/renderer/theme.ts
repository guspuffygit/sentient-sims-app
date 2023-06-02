import { createTheme } from '@mui/material/styles';

// Define the dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7289da',
      dark: '#4a5f8a',
      light: '#b9bbdf',
    },
    secondary: {
      main: '#ffffff',
      dark: '#e6e6e6',
      light: '#ffffff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b9bbdf',
      disabled: '#72767d',
    },
    background: {
      default: '#2f3136',
      paper: '#36393f',
    },
    action: {
      active: '#ffffff',
      hover: '#4a5f8a',
      selected: '#4a5f8a',
      disabled: '#72767d',
      disabledBackground: '#36393f',
    },
    divider: '#4f545c',
  },
});

export default theme;
