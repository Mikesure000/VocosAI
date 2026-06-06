import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableRow,
  TableHead, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab,
} from '@mui/material';
import { ArrowBack, Add, Edit, CheckCircle, Block } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function PromptManagement() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [form, setForm] = useState({ promptName: '', agentId: '', systemPrompt: '', userPromptTemplate: '', version: '1.1.0', changeLog: '' });

  const load = () => {
    Promise.all([
      apiClient.get('/api/admin/ai/prompts').then((r) => setPrompts(r.data)),
      apiClient.get('/api/admin/ai/agents').then((r) => setAgents(r.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await apiClient.post('/api/admin/ai/prompts', form);
    setDialogOpen(false);
    setForm({ promptName: '', agentId: '', systemPrompt: '', userPromptTemplate: '', version: '1.1.0', changeLog: '' });
    load();
  };

  const handleEdit = async () => {
    if (!selectedPrompt) return;
    await apiClient.put(`/api/admin/ai/prompts/${selectedPrompt.id}`, form);
    setEditDialog(false);
    load();
  };

  const openEdit = (prompt: any) => {
    setSelectedPrompt(prompt);
    setForm({
      promptName: prompt.promptName,
      agentId: prompt.agentId,
      systemPrompt: prompt.versions?.[0]?.systemPrompt || '',
      userPromptTemplate: prompt.versions?.[0]?.userPromptTemplate || '',
      version: '1.1.0',
      changeLog: '',
    });
    setEditDialog(true);
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>Prompt 管理</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>创建 Prompt</Button>
      </Box>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>版本</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Typography fontWeight={600}>{p.promptName}</Typography></TableCell>
                <TableCell>{p.agent?.agentName || '-'}</TableCell>
                <TableCell>{p.versions?.[0]?.version || '-'}</TableCell>
                <TableCell><Chip label={p.status === 'active' ? '启用' : '停用'} size="small" color={p.status === 'active' ? 'success' : 'default'} /></TableCell>
                <TableCell>
                  <Button size="small" onClick={() => openEdit(p)}>编辑</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>创建 Prompt</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Prompt 名称" value={form.promptName} onChange={(e) => setForm({ ...form, promptName: e.target.value })} margin="normal" />
          <TextField select fullWidth label="绑定 Agent" value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })} margin="normal"
            SelectProps={{ native: true }}>
            <option value="">-- 选择 Agent --</option>
            {agents.map((a: any) => <option key={a.id} value={a.id}>{a.agentName}</option>)}
          </TextField>
          <TextField fullWidth label="System Prompt" value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} margin="normal" multiline rows={4} />
          <TextField fullWidth label="User Prompt 模板" value={form.userPromptTemplate} onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })} margin="normal" multiline rows={4} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreate}>创建</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>编辑 Prompt</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="新版本号" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} margin="normal" />
          <TextField fullWidth label="变更说明" value={form.changeLog} onChange={(e) => setForm({ ...form, changeLog: e.target.value })} margin="normal" />
          <TextField fullWidth label="System Prompt" value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} margin="normal" multiline rows={6} />
          <TextField fullWidth label="User Prompt 模板" value={form.userPromptTemplate} onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })} margin="normal" multiline rows={6} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleEdit}>保存新版本</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
