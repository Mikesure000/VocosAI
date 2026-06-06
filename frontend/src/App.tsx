import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import AppRouter from './app/router/AppRouter';
import { useThemeStore } from './shared/stores/themeStore';
import { getTheme } from './app/theme/theme';
import AuthProvider from './app/providers/AuthProvider';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
