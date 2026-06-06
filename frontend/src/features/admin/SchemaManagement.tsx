import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableRow,
  TableHead, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function SchemaManagement() {
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ schemaName: '', schemaVersion: '1.0.0', schemaJson: '{}' });

  const load = () => {
    apiClient.get('/api/admin/ai/schemas').then((r) => setSchemas(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await apiClient.post('/api/admin/ai/schemas', {
        ...form,
        schemaJson: JSON.parse(form.schemaJson),
      });
      setDialogOpen(false);
      setForm({ schemaName: '', schemaVersion: '1.0.0', schemaJson: '{}' });
      load();
    } catch (e) { /* JSON parse error */ }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>Schema 管理</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>创建 Schema</Button>
      </Box>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell>版本</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemas.map((s) => (
              <TableRow key={s.id}>
                <TableCell><Typography fontWeight={600}>{s.schemaName}</Typography></TableCell>
                <TableCell>{s.schemaVersion}</TableCell>
                <TableCell><Chip label={s.status === 'active' ? '启用' : '停用'} size="small" color={s.status === 'active' ? 'success' : 'default'} /></TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>创建 Schema</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Schema 名称" value={form.schemaName} onChange={(e) => setForm({ ...form, schemaName: e.target.value })} margin="normal" />
          <TextField fullWidth label="版本" value={form.schemaVersion} onChange={(e) => setForm({ ...form, schemaVersion: e.target.value })} margin="normal" />
          <TextField fullWidth label="JSON Schema" value={form.schemaJson} onChange={(e) => setForm({ ...form, schemaJson: e.target.value })} margin="normal" multiline rows={10} placeholder='{"type":"object","properties":{}}' />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreate}>创建</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
