import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  Table, TableBody, TableCell, TableRow, TableHead,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { ArrowBack, Compare, TrendingUp, TrendingDown } from '@mui/icons-material';

const mockComparison = {
  tasks: [
    { id: '1', name: '小细跟口红测评', platform: 'douyin', likes: 12500, comments: 850, shares: 320, ctr: 4.2 },
    { id: '2', name: '口红平替对比', platform: 'xiaohongshu', likes: 8900, comments: 620, shares: 210, ctr: 3.8 },
    { id: '3', name: '口红试色合集', platform: 'douyin', likes: 22000, comments: 1500, shares: 580, ctr: 5.1 },
  ],
  commonInsights: [
    '价格异议是共性问题，3条内容中均出现',
    '效果追问高频出现，需要更多真实案例',
    '肤质适配需求普遍存在',
  ],
  differences: [
    { dimension: '开头钩子', best: '口红试色合集', worst: '口红平替对比', insight: '视觉冲击型开头效果优于价格对比型' },
    { dimension: 'CTA设计', best: '小细跟口红测评', worst: '口红试色合集', insight: '明确引导评论的内容转化率更高' },
    { dimension: '证明机制', best: '口红试色合集', worst: '口红平替对比', insight: '多维度对比比单一对比更有说服力' },
  ],
};

export default function MultiComparePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>多内容对比</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Task Selection */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>选择对比内容</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {mockComparison.tasks.map((t) => (
                  <Chip key={t.id} label={`${t.name} (${t.platform === 'douyin' ? '抖音' : '小红书'})`}
                    onClick={() => setSelected((prev) => prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id])}
                    color={selected.includes(t.id) ? 'primary' : 'default'}
                    variant={selected.includes(t.id) ? 'filled' : 'outlined'} />
                ))}
              </Box>
              <Button variant="contained" startIcon={<Compare />} disabled={selected.length < 2} sx={{ mt: 2 }}>
                开始对比
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Table */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>表现对比</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>内容</TableCell>
                    <TableCell align="right">点赞</TableCell>
                    <TableCell align="right">评论</TableCell>
                    <TableCell align="right">分享</TableCell>
                    <TableCell align="right">CTR%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockComparison.tasks.map((t) => (
                    <TableRow key={t.id} sx={{ bgcolor: t.ctr === Math.max(...mockComparison.tasks.map((x) => x.ctr)) ? 'success.light' : undefined }}>
                      <TableCell>{t.name}<Chip label={t.platform === 'douyin' ? '抖音' : '小红书'} size="small" sx={{ ml: 1 }} /></TableCell>
                      <TableCell align="right">{t.likes.toLocaleString()}</TableCell>
                      <TableCell align="right">{t.comments.toLocaleString()}</TableCell>
                      <TableCell align="right">{t.shares.toLocaleString()}</TableCell>
                      <TableCell align="right"><Chip label={`${t.ctr}%`} size="small" color={t.ctr >= 4 ? 'success' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>共性发现</Typography>
              {mockComparison.commonInsights.map((insight, i) => (
                <Box key={i} display="flex" alignItems="start" gap={1} mb={1}>
                  <TrendingUp color="primary" fontSize="small" />
                  <Typography variant="body2">{insight}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>差异分析</Typography>
              {mockComparison.differences.map((d, i) => (
                <Box key={i} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" fontWeight={600}>{d.dimension}</Typography>
                  <Typography variant="caption">最佳: {d.best} | 最差: {d.worst}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">{d.insight}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
