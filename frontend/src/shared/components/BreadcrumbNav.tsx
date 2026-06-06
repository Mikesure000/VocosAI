import { Breadcrumbs, Link, Typography, Chip } from '@mui/material';
import { NavigateNext, Home, Folder, Assessment } from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface Crumb { label: string; path?: string; icon?: React.ReactNode; chip?: { label: string; color?: any }; }

export function BreadcrumbNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const crumbs: Crumb[] = [{ label: '工作台', path: '/workspace', icon: <Home sx={{ fontSize: 16 }} /> }];

  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.includes('projects')) {
    const idx = parts.indexOf('projects');
    const pid = params.id || parts[idx + 1];
    crumbs.push({ label: '项目管理', path: '/projects', icon: <Folder sx={{ fontSize: 16 }} /> });
    if (pid && parts.includes('projects')) {
      crumbs.push({ label: `项目`, path: `/projects/${pid}` });
    }
  }

  if (parts.includes('tasks')) {
    const tidx = parts.indexOf('tasks');
    const tid = params.taskId || parts[tidx + 1];
    if (tid) {
      const pathBase = location.pathname.split('/tasks/')[0];
      crumbs.push({ label: `任务`, path: `${pathBase}/tasks/${tid}/insights` });
    }
  }

  // 当前页面
  const pageMap: Record<string, string> = {
    'new': '创建任务', 'mapping': '字段映射', 'progress': '分析进度',
    'content': '内容拆解', 'cleaning': '评论清洗', 'insights': '分析结果',
    'high-value': '高价值评论', 'demand-map': '需求地图', 'barrier-map': '障碍地图',
    'attribution': '内容归因', 'strategy': '策略卡', 'douyin': '抖音生产卡',
    'xiaohongshu': '小红书生产卡', 'comment-ops': '评论区运营',
    'ad-fit': '投流适配', 'pre-publish-check': '发布质检', 'reports': '报告中心',
    'compare': '多内容对比', 'collaborate': '团队协作', 'brands': '品牌管理',
    'settings': '设置', 'admin': '管理后台', 'trends': '数据看板',
  };

  const lastPart = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  if (pageMap[lastPart]) crumbs.push({ label: pageMap[lastPart] });
  else if (pageMap[secondLast]) crumbs.push({ label: pageMap[secondLast] });

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2, fontSize: 13 }}>
      {crumbs.map((c, i) =>
        i === crumbs.length - 1 ? (
          <Typography key={i} color="text.primary" fontWeight={600} fontSize={13}>
            {c.icon}{c.label}
          </Typography>
        ) : (
          <Link key={i} underline="hover" color="text.secondary" sx={{ cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.5 }}
            onClick={() => c.path && navigate(c.path)}>
            {c.icon}{c.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
}
