import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Backdrop } from '@mui/material';
import { Add, ContentCopy, AutoAwesome, Assessment, Timeline } from '@mui/icons-material';

interface QuickActionsProps {
  onQuickAnalyze?: () => void;
  onCopyLastTask?: () => void;
}

export function QuickActions({ onQuickAnalyze, onCopyLastTask }: QuickActionsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: <Add />, name: '新建分析', action: () => navigate('/projects') },
    { icon: <ContentCopy />, name: '复制上次任务', action: onCopyLastTask || (() => {}) },
    { icon: <Timeline />, name: '数据看板', action: () => navigate('/trends') },
    { icon: <Assessment />, name: '报告中心', action: () => navigate('/export-center') },
  ];

  return (
    <>
      <Backdrop open={open} sx={{ zIndex: 1000 }} />
      <SpeedDial
        ariaLabel="快捷操作"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1050 }}
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((a) => (
          <SpeedDialAction key={a.name} icon={a.icon} tooltipTitle={a.name} onClick={() => { a.action(); setOpen(false); }} />
        ))}
      </SpeedDial>
    </>
  );
}

/** 根据评论数量估算分析时间 */
export function estimateAnalysisTime(commentCount: number): string {
  if (commentCount <= 100) return '约 1-2 分钟';
  if (commentCount <= 500) return '约 3-5 分钟';
  if (commentCount <= 2000) return '约 5-10 分钟';
  if (commentCount <= 5000) return '约 10-20 分钟';
  return '约 20-30 分钟';
}
