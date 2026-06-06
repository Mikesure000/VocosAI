import { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material';
import { CloudOff, Wifi, Refresh } from '@mui/icons-material';
import { apiClient } from '../api/client';

export function useConnectionMonitor() {
  const [online, setOnline] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let failCount = 0;

    const check = async () => {
      try {
        await apiClient.get('/api/health', { timeout: 5000 });
        if (!online) setOnline(true);
        failCount = 0;
        setReconnecting(false);
      } catch {
        failCount++;
        if (failCount >= 2 && online) {
          setOnline(false);
          setReconnecting(true);
        }
      }
    };

    check();
    timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, [online]);

  const handleReconnect = () => {
    setReconnecting(true);
    window.location.reload();
  };

  const StatusBar = !online ? (
    <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        icon={<CloudOff />}
        action={
          <Button size="small" startIcon={<Refresh />} onClick={handleReconnect}>
            {reconnecting ? '重连中...' : '重新连接'}
          </Button>
        }
        sx={{ boxShadow: 3, minWidth: 300 }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">后端连接断开，正在自动重连...</Typography>
        </Box>
      </Alert>
    </Snackbar>
  ) : null;

  return { online, StatusBar };
}
