import { Component, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} textAlign="center">
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>页面加载出错</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {this.state.error?.message || '发生了未知错误'}
          </Typography>
          <Button variant="contained" startIcon={<Refresh />} onClick={this.handleReset}>
            重试
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
