import { createTheme } from '@mui/material/styles';

export function getTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#4ade80' : '#16a34a',
      },
      background: {
        default: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        paper: mode === 'dark' ? '#141414' : '#ffffff',
      },
    },
    typography: {
      fontFamily: "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
          },
        },
      },
    },
  });
}
