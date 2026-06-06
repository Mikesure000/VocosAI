import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, CircularProgress, LinearProgress,
} from '@mui/material';
import { ArrowBack, VerifiedUser, Edit, Refresh, Warning, Speed } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function QualityDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/admin/ai/quality-summary').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  const metrics = [
    { label: 'AI 调用总数', value: data.totalRuns || 0, color: '#2196f3' },
    { label: '成功率', value: `${data.successRate || 0}%`, color: '#4caf50' },
    { label: '采纳率', value: `${data.adoptionRate || 0}%`, color: '#ff9800' },
    { label: '编辑率', value: `${data.editRate || 0}%`, color: '#9c27b0' },
    { label: '重生成率', value: `${data.regenerationRate || 0}%`, color: '#f44336' },
    { label: '平均延迟', value: `${data.averageLatency || 0}ms`, color: '#00bcd4' },
    { label: 'JSON 失败率', value: `${data.jsonFailRate || 0}%`, color: '#ff5722' },
  ];

  const bars = [
    { label: '成功率', value: data.successRate || 0, color: '#4caf50', icon: <VerifiedUser /> },
    { label: '采纳率', value: data.adoptionRate || 0, color: '#ff9800', icon: <VerifiedUser /> },
    { label: '编辑率', value: data.editRate || 0, color: '#9c27b0', icon: <Edit /> },
    { label: '重生成率', value: data.regenerationRate || 0, color: '#f44336', icon: <Refresh /> },
    { label: 'JSON失败率', value: data.jsonFailRate || 0, color: '#ff5722', icon: <Warning /> },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>质量仪表盘</Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        {metrics.map((m) => (
          <Grid size={{ xs: 6, sm: 4, md: 1.7 }} key={m.label}>
            <Card sx={{ borderTop: `3px solid ${m.color}` }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700}>{m.value}</Typography>
                <Typography variant="caption" color="text.secondary">{m.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>质量指标</Typography>
          {bars.map((b) => (
            <Box key={b.label} mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color: b.color }}>{b.icon}</Box>
                  <Typography variant="body2">{b.label}</Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>{b.value}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={b.value} sx={{ height: 8, borderRadius: 4 }}
                sx2={{ '& .MuiLinearProgress-bar': { backgroundColor: b.color } }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
