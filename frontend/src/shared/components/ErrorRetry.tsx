import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Error as ErrorIcon, Refresh, Help } from '@mui/icons-material';

interface ErrorRetryProps {
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorRetry({ message = '加载失败', onRetry, fullPage }: ErrorRetryProps) {
  const content = (
    <Box display="flex" flexDirection="column" alignItems="center" py={fullPage ? 8 : 2} textAlign="center">
      <ErrorIcon sx={{ fontSize: fullPage ? 64 : 40, color: 'error.main', mb: 2 }} />
      <Typography variant={fullPage ? 'h5' : 'h6'} gutterBottom>{message}</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        请检查网络连接后重试，或联系管理员
      </Typography>
      <Box display="flex" gap={1}>
        {onRetry && <Button variant="contained" startIcon={<Refresh />} onClick={onRetry}>重试</Button>}
        <Button variant="outlined" startIcon={<Help />} onClick={() => window.location.href = '/workspace'}>返回工作台</Button>
      </Box>
    </Box>
  );

  if (fullPage) return content;
  return <Card variant="outlined"><CardContent>{content}</CardContent></Card>;
}
