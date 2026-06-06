import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip, CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { People, Group, Assessment, Memory, AttachMoney, VerifiedUser, Description, Api, Schema, SmartToy } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [aiRuns, setAiRuns] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/admin/stats').then((r) => setStats(r.data)),
      apiClient.get('/api/admin/users').then((r) => setUsers(r.data)),
      apiClient.get('/api/admin/ai/runs?limit=20').then((r) => setAiRuns(r.data.runs || [])),
      apiClient.get('/api/admin/audit-logs?limit=20').then((r) => setAuditLogs(r.data.logs || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  const navCards = [
    { label: '用户管理', icon: <People />, path: '/admin', tab: 0 },
    { label: 'AI Run 日志', icon: <Memory />, path: '/admin', tab: 1 },
    { label: '审计日志', icon: <Assessment />, path: '/admin/audit-logs' },
    { label: 'Prompt 管理', icon: <Api />, path: '/admin/prompts' },
    { label: 'Schema 管理', icon: <Schema />, path: '/admin/schemas' },
    { label: 'Agent 管理', icon: <SmartToy />, path: '/admin/agents' },
    { label: '成本仪表盘', icon: <AttachMoney />, path: '/admin/costs' },
    { label: '质量仪表盘', icon: <VerifiedUser />, path: '/admin/quality' },
    { label: 'Skill 学习', icon: <AutoAwesome />, path: '/admin/skills' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>管理后台</Typography>

      <Grid container spacing={2} mb={3}>
        {navCards.map((card) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={card.label}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(card.path, card.tab !== undefined ? undefined : undefined)}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  {card.icon}
                  <Typography variant="body2" fontWeight={600}>{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={3}>
        {[
          { label: '用户', value: stats.users || 0, color: '#4caf50' },
          { label: '团队', value: stats.teams || 0, color: '#2196f3' },
          { label: '项目', value: stats.projects || 0, color: '#ff9800' },
          { label: '任务', value: stats.tasks || 0, color: '#9c27b0' },
          { label: '报告', value: stats.reports || 0, color: '#f44336' },
        ].map((c) => (
          <Grid size={{ xs: 6, sm: 2.4 }} key={c.label}>
            <Card sx={{ borderTop: `3px solid ${c.color}` }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700}>{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="用户管理" />
        <Tab label="AI Run 日志" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <Table size="small">
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.role} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={u.status === 'active' ? '活跃' : '禁用'} size="small" color={u.status === 'active' ? 'success' : 'error'} /></TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <Table size="small">
            <TableBody>
              {aiRuns.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.agentName}</TableCell>
                  <TableCell>{r.modelName}</TableCell>
                  <TableCell>{r.totalTokenCount}</TableCell>
                  <TableCell>¥{r.actualCost?.toFixed(4)}</TableCell>
                  <TableCell>{r.latencyMs}ms</TableCell>
                  <TableCell><Chip label={r.status} size="small" color={r.status === 'success' ? 'success' : 'error'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
