import { Box, Typography, Button } from '@mui/material';
import { Inbox, Add } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = '暂无数据',
  description = '还没有任何内容，点击按钮开始创建',
  actionLabel = '创建',
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} textAlign="center">
      {icon || <Inbox sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
      <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.disabled" mb={3}>{description}</Typography>
      {onAction && (
        <Button variant="outlined" startIcon={<Add />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
