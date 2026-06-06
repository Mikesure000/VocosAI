import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, CircularProgress,
} from '@mui/material';
import { ArrowBack, TrendingUp, BarChart, PieChart } from '@mui/icons-material';
import {
  BarChart as ReBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { apiClient } from '../../shared/api/client';
import { PageSkeleton } from '../../shared/components/SkeletonLoader';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ff5722', '#795548'];

export default function TrendsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/workspace/stats'),
      apiClient.get('/api/admin/ai/cost-summary'),
      apiClient.get('/api/admin/ai/quality-summary'),
    ]).then(([ws, cost, quality]) => {
      setData({ workspace: ws.data, cost: cost.data, quality: quality.data });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;
  if (!data) return null;

  const ws = data.workspace;
  const cost = data.cost;
  const quality = data.quality;

  // 任务状态分布
  const taskStatusData = [
    { name: '已完成', value: ws.completedTasks || 0, color: '#4caf50' },
    { name: '进行中', value: (ws.tasks || 0) - (ws.completedTasks || 0), color: '#2196f3' },
  ];

  // 按模型成本
  const modelCostData = (cost.byModel || []).map((m: any) => ({
    name: m.modelName || 'unknown',
    cost: Math.round(m.cost * 10000) / 10000,
  }));

  // 日成本趋势
  const dailyData = (cost.dailyCosts || []).slice(-14).map((d: any) => ({
    date: d.date?.slice(5),
    cost: Math.round(d.cost * 10000) / 10000,
  }));

  // 质量指标
  const qualityData = [
    { name: '成功率', value: quality.successRate || 0 },
    { name: '采纳率', value: quality.adoptionRate || 0 },
    { name: 'JSON失败率', value: quality.jsonFailRate || 0 },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/workspace')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>数据看板</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 任务分布饼图 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PieChart sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
                任务状态
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <RePie>
                  <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {taskStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </RePie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 质量指标柱状图 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BarChart sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
                质量指标 %
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <ReBar data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2196f3" radius={[4, 4, 0, 0]} />
                </ReBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 按模型成本 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
                模型成本 ¥
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <ReBar data={modelCostData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={100} fontSize={11} />
                  <Tooltip formatter={(v: number) => `¥${v.toFixed(4)}`} />
                  <Bar dataKey="cost" fill="#ff9800" radius={[0, 4, 4, 0]} />
                </ReBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 日成本趋势 */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
                日成本趋势 (近14天)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `¥${v.toFixed(4)}`} />
                  <Line type="monotone" dataKey="cost" stroke="#4caf50" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
