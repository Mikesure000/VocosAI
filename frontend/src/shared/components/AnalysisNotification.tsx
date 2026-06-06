import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, HourglassEmpty } from '@mui/icons-material';
import { apiClient } from '../api/client';

interface TaskWatcher {
  taskId: string;
  projectId: string;
  taskName: string;
}

export function useAnalysisNotifier() {
  const [watching, setWatching] = useState<TaskWatcher[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string; taskId?: string; projectId?: string } | null>(null);
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startWatching = (taskId: string, projectId: string, taskName: string) => {
    setWatching((prev) => {
      if (prev.find((w) => w.taskId === taskId)) return prev;
      return [...prev, { taskId, projectId, taskName }];
    });
  };

  useEffect(() => {
    if (watching.length === 0) return;
    intervalRef.current = setInterval(async () => {
      const stillWatching: TaskWatcher[] = [];
      for (const w of watching) {
        try {
          const res = await apiClient.get(`/api/tasks/${w.taskId}/status`);
          const status = res.data.status;
          if (status === 'completed') {
            setNotification({ type: 'success', message: `「${w.taskName}」分析完成`, taskId: w.taskId, projectId: w.projectId });
          } else if (status === 'failed' || status === 'partially_failed') {
            setNotification({ type: 'error', message: `「${w.taskName}」分析失败`, taskId: w.taskId, projectId: w.projectId });
          } else {
            stillWatching.push(w);
          }
        } catch { stillWatching.push(w); }
      }
      setWatching(stillWatching);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [watching]);

  const NotificationBar = notification ? (
    <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 8 }}>
      <Alert
        severity={notification.type}
        icon={notification.type === 'success' ? <CheckCircle /> : notification.type === 'error' ? <ErrorIcon /> : <HourglassEmpty />}
        action={
          notification.taskId && (
            <Button size="small" onClick={() => { navigate(`/projects/${notification.projectId}/tasks/${notification.taskId}/insights`); setNotification(null); }}>
              查看结果
            </Button>
          )
        }
        onClose={() => setNotification(null)}
        sx={{ boxShadow: 3 }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  ) : null;

  return { startWatching, NotificationBar };
}
