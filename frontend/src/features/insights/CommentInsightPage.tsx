import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  CircularProgress, Table, TableBody, TableCell, TableRow, TableHead,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, TrendingUp, TrendingDown, Warning, Lightbulb } from '@mui/icons-material';
import { taskApi } from '../../shared/api/task.api';

interface SignalStat {
  key: string;
  label: string;
  count: number;
  category: string;
}

interface SignalStats {
  totalComments: number;
  totalWithSignals: number;
  signalCounts: SignalStat[];
  valueDistribution: Record<string, number>;
}

const categoryColors: Record<string, string> = {
  intent: '#4caf50',
  barrier: '#f44336',
  sentiment: '#ff9800',
  action: '#2196f3',
};

export default function CommentInsightPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    taskApi.getSignalStats(taskId).then((res) => {
      setStats(res.data);
    }).finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  const pages = [
    { label: '内容拆解', path: `/projects/${projectId}/tasks/${taskId}/content` },
    { label: '评论清洗', path: `/projects/${projectId}/tasks/${taskId}/comments/cleaning` },
    { label: '高价值评论', path: `/projects/${projectId}/tasks/${taskId}/high-value` },
    { label: '需求地图', path: `/projects/${projectId}/tasks/${taskId}/demand-map` },
    { label: '障碍地图', path: `/projects/${projectId}/tasks/${taskId}/barrier-map` },
    { label: '内容归因', path: `/projects/${projectId}/tasks/${taskId}/attribution` },
    { label: '策略卡', path: `/projects/${projectId}/tasks/${taskId}/strategy` },
    { label: '抖音生产卡', path: `/projects/${projectId}/tasks/${taskId}/production/douyin` },
    { label: '小红书生产卡', path: `/projects/${projectId}/tasks/${taskId}/production/xiaohongshu` },
    { label: '评论运营', path: `/projects/${projectId}/tasks/${taskId}/comment-ops` },
    { label: '投流适配', path: `/projects/${projectId}/tasks/${taskId}/ad-fit` },
    { label: '发布质检', path: `/projects/${projectId}/tasks/${taskId}/pre-publish-check` },
    { label: '报告中心', path: `/projects/${projectId}/tasks/${taskId}/reports` },
  ];

  const totalValueScores = Object.values(stats?.valueDistribution || {}).reduce((a, b) => a + b, 0);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>评论洞察</Typography>
        <Chip label={`${stats?.totalComments || 0} 条评论`} variant="outlined" />
        <Chip label={`${stats?.totalWithSignals || 0} 条有信号`} color="primary" variant="outlined" />
      </Box>

      {/* Signal Categories */}
      <Grid container spacing={3} mb={3}>
        {['intent', 'barrier', 'sentiment', 'action'].map((cat) => {
          const catSignals = stats?.signalCounts.filter((s) => s.category === cat) || [];
          const catTotal = catSignals.reduce((sum, s) => sum + s.count, 0);
          const catLabels: Record<string, string> = { intent: '购买意图', barrier: '购买障碍', sentiment: '情感信号', action: '行动信号' };
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat}>
              <Card sx={{ borderLeft: `4px solid ${categoryColors[cat] || '#999'}` }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{catLabels[cat] || cat}</Typography>
                  <Typography variant="h4" fontWeight={700}>{catTotal}</Typography>
                  <Typography variant="caption" color="text.disabled">{catSignals.length} 种信号类型</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Signal Detail Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>评论信号分布</Typography>
          {!stats?.signalCounts.length ? (
            <Typography color="text.secondary">暂无信号数据</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>信号类型</TableCell>
                  <TableCell>分类</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell align="right">占比</TableCell>
                  <TableCell>分布</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.signalCounts.map((s) => (
                  <TableRow key={s.key}>
                    <TableCell>
                      <Typography fontWeight={600}>{s.label}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.category === 'intent' ? '意图' : s.category === 'barrier' ? '障碍' : s.category === 'sentiment' ? '情感' : '行动'}
                        size="small"
                        sx={{ backgroundColor: categoryColors[s.category] || '#999', color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell align="right">{s.count}</TableCell>
                    <TableCell align="right">
                      {((s.count / Math.max(stats.totalComments, 1)) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={(s.count / Math.max(stats.signalCounts[0]?.count || 1, 1)) * 100}
                        sx={{ height: 6, borderRadius: 3, backgroundColor: 'action.hover' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Value Score Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>评论价值评分分布</Typography>
          <Box display="flex" gap={1} alignItems="flex-end" height={120}>
            {[1, 2, 3, 4, 5].map((score) => {
              const count = stats?.valueDistribution?.[String(score)] || 0;
              const pct = totalValueScores > 0 ? (count / totalValueScores) * 100 : 0;
              return (
                <Box key={score} flex={1} display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="caption" fontWeight={600}>{count}</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${Math.max(pct * 2, 4)}px`,
                      backgroundColor: score >= 4 ? '#4caf50' : score >= 3 ? '#ff9800' : '#f44336',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">{score}分</Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Navigation to other analysis pages */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>分析结果导航</Typography>
          <Grid container spacing={1}>
            {pages.map((page) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={page.path}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(page.path)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {page.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
