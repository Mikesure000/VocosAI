import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableRow,
  TableHead, Chip, CircularProgress, Switch,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function AgentManagement() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient.get('/api/admin/ai/agents/detail').then((r) => setAgents(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleAgent = async (id: string) => {
    await apiClient.put(`/api/admin/ai/agents/${id}/toggle`);
    load();
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>Agent 管理</Typography>
      </Box>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>序号</TableCell>
              <TableCell>Agent 名称</TableCell>
              <TableCell>代码</TableCell>
              <TableCell>版本</TableCell>
              <TableCell>Prompt</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((a, i) => (
              <TableRow key={a.id}>
                <TableCell>{a.executionOrder}</TableCell>
                <TableCell><Typography fontWeight={600}>{a.agentName}</Typography></TableCell>
                <TableCell><Chip label={a.agentCode} size="small" variant="outlined" /></TableCell>
                <TableCell>{a.agentVersion}</TableCell>
                <TableCell>{a.aiPrompts?.length || 0} 个</TableCell>
                <TableCell>
                  <Chip label={a.status === 'active' ? '启用' : '停用'} size="small" color={a.status === 'active' ? 'success' : 'error'} />
                </TableCell>
                <TableCell>
                  <Switch size="small" checked={a.status === 'active'} onChange={() => toggleAgent(a.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
