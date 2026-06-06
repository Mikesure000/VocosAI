import { Chip, Tooltip } from '@mui/material';
import { HourglassEmpty, CloudUpload, PlayArrow, Autorenew, CheckCircle, Error as ErrorIcon, Archive } from '@mui/icons-material';

const statusConfig: Record<string, { label: string; color: any; icon: React.ReactNode; desc: string }> = {
  draft: { label: '草稿', color: 'default', icon: <HourglassEmpty fontSize="small" />, desc: '任务已创建，等待上传评论文件' },
  uploaded: { label: '已上传', color: 'info', icon: <CloudUpload fontSize="small" />, desc: '文件已上传，等待字段映射确认' },
  mapping_required: { label: '待映射', color: 'warning', icon: <CloudUpload fontSize="small" />, desc: '请确认评论字段映射关系' },
  ready: { label: '就绪', color: 'info', icon: <PlayArrow fontSize="small" />, desc: '配置完成，点击启动AI分析' },
  analyzing: { label: '分析中', color: 'info', icon: <Autorenew fontSize="small" />, desc: 'AI正在分析评论数据...' },
  completed: { label: '已完成', color: 'success', icon: <CheckCircle fontSize="small" />, desc: '分析完成，可查看结果' },
  partially_failed: { label: '部分失败', color: 'warning', icon: <ErrorIcon fontSize="small" />, desc: '部分Agent执行失败，可查看已有结果' },
  failed: { label: '失败', color: 'error', icon: <ErrorIcon fontSize="small" />, desc: '分析失败，请重试' },
  archived: { label: '已归档', color: 'default', icon: <Archive fontSize="small" />, desc: '任务已归档' },
};

export function TaskStatusBadge({ status, size = 'small' }: { status: string; size?: 'small' | 'medium' }) {
  const config = statusConfig[status] || { label: status, color: 'default', icon: null, desc: '' };
  return (
    <Tooltip title={config.desc}>
      <Chip
        icon={config.icon as any}
        label={config.label}
        size={size as any}
        color={config.color as any}
        variant={status === 'completed' || status === 'analyzing' ? 'filled' : 'outlined'}
      />
    </Tooltip>
  );
}
