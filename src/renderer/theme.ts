import { alpha, createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

declare module '@mui/material/styles' {
  interface TypeBackground {
    elevated: string;
  }
}

// Design tokens for the Sentient Sims dark theme.
// The look keeps the original Discord-adjacent blurple identity,
// with layered surfaces, soft borders, and no default MUI chrome.
const colors = {
  blurple: '#7c8aec',
  blurpleLight: '#a5b3ff',
  blurpleDark: '#5a6ccf',
  bgDefault: '#232428',
  bgPaper: '#2b2d33',
  bgElevated: '#33353d',
  textPrimary: '#f2f3f7',
  textSecondary: '#a6adc8',
  textDisabled: '#72767d',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
};

const fontStack = [
  "'Inter Variable'",
  "'Inter'",
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'Roboto',
  "'Helvetica Neue'",
  'sans-serif',
].join(', ');

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.blurple,
      dark: colors.blurpleDark,
      light: colors.blurpleLight,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dcdee6',
      dark: '#b8bac2',
      light: '#ffffff',
    },
    success: {
      main: '#43b581',
      dark: '#358f66',
      light: '#6fd0a3',
    },
    warning: {
      main: '#f0b232',
      dark: '#c98f1c',
      light: '#f5c866',
    },
    error: {
      main: '#f04747',
      dark: '#c73434',
      light: '#f57373',
    },
    info: {
      main: '#57b0f0',
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
    },
    background: {
      default: colors.bgDefault,
      paper: colors.bgPaper,
      elevated: colors.bgElevated,
    },
    action: {
      active: colors.textPrimary,
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: alpha(colors.blurple, 0.16),
      disabled: colors.textDisabled,
      disabledBackground: 'rgba(255, 255, 255, 0.08)',
    },
    divider: colors.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: fontStack,
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'body': {
          backgroundColor: colors.bgDefault,
          backgroundImage: `radial-gradient(ellipse 80% 40% at 50% -10%, ${alpha(colors.blurple, 0.09)}, transparent)`,
          backgroundRepeat: 'no-repeat',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.18) transparent',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
        },
        contained: {
          // Subtle top-light sheen so contained buttons read as tactile, not flat
          'backgroundImage': 'linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0) 50%)',
          'boxShadow': '0 1px 2px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
          },
          '&.Mui-disabled': {
            backgroundImage: 'none',
          },
        },
        outlined: {
          'borderColor': colors.borderStrong,
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.28)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            '&:hover': {
              backgroundColor: colors.blurpleLight,
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            'borderColor': alpha(colors.blurple, 0.5),
            '&:hover': {
              borderColor: colors.blurple,
              backgroundColor: alpha(colors.blurple, 0.08),
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            'color': colors.textPrimary,
            'borderColor': colors.borderStrong,
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.28)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
        {
          props: { variant: 'text', color: 'secondary' },
          style: {
            'color': colors.textSecondary,
            '&:hover': {
              color: colors.textPrimary,
            },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          'transition': 'background-color 120ms ease, color 120ms ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          'textTransform': 'none',
          'fontWeight': 600,
          'fontSize': '0.9rem',
          '&.Mui-selected': {
            color: colors.blurpleLight,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: colors.blurple,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          'borderRadius': 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.borderStrong,
            transition: 'border-color 120ms ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.28)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.blurple,
            borderWidth: 1,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.bgElevated,
          border: `1px solid ${colors.borderStrong}`,
          color: colors.textPrimary,
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          padding: '6px 10px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bgElevated,
          color: colors.textPrimary,
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          'border': 'none',
          '--DataGrid-rowBorderColor': colors.border,
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: `1px solid ${colors.borderStrong}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: colors.textSecondary,
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            'backgroundColor': alpha(colors.blurple, 0.14),
            '&:hover': {
              backgroundColor: alpha(colors.blurple, 0.2),
            },
          },
        },
      },
    },
  },
});

export default theme;
