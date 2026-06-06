import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  CircularProgress, Table, TableBody, TableCell, TableRow, TableHead,
} from '@mui/material';
import { ArrowBack, AttachMoney, TrendingUp, Memory, AutoAwesome } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function CostDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/admin/ai/cost-summary').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>成本仪表盘</Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        {[
          { label: '总成本', value: `¥${(data.totalCost || 0).toFixed(4)}`, icon: <AttachMoney />, color: '#f44336' },
          { label: '总 Token', value: (data.totalTokens || 0).toLocaleString(), icon: <TrendingUp />, color: '#2196f3' },
          { label: '日平均', value: `¥${(((data.totalCost || 0) / Math.max(data.dailyCosts?.length || 1, 1))).toFixed(4)}`, icon: <Memory />, color: '#ff9800' },
        ].map((c) => (
          <Grid size={{ xs: 12, sm: 4 }} key={c.label}>
            <Card sx={{ borderTop: `3px solid ${c.color}` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                {c.icon}
                <Typography variant="h5" fontWeight={700}>{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>按模型</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow><TableCell>模型</TableCell><TableCell align="right">成本</TableCell><TableCell align="right">Token</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {data.byModel?.map((m: any) => (
                    <TableRow key={m.modelName}>
                      <TableCell><Chip label={m.modelName || '-'} size="small" /></TableCell>
                      <TableCell align="right">¥{m.cost.toFixed(4)}</TableCell>
                      <TableCell align="right">{m.tokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>按 Agent</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow><TableCell>Agent</TableCell><TableCell align="right">成本</TableCell><TableCell align="right">Token</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {data.byAgent?.slice(0, 10).map((a: any) => (
                    <TableRow key={a.agentName}>
                      <TableCell>{a.agentName || '-'}</TableCell>
                      <TableCell align="right">¥{a.cost.toFixed(4)}</TableCell>
                      <TableCell align="right">{a.tokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
