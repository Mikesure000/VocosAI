import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton,
  Table, TableBody, TableCell, TableRow, FormControl, Select, MenuItem,
} from '@mui/material';
import { ArrowBack, Add, PersonAdd, Delete, AdminPanelSettings, Edit } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const mockMembers = [
  { id: '1', name: '系统管理员', email: 'admin@vocosai.com', role: 'team_admin', avatar: '管' },
  { id: '2', name: '演示用户', email: 'demo@vocosai.com', role: 'member', avatar: '演' },
];

const roleLabels: Record<string, string> = {
  team_admin: '团队管理员', project_lead: '项目负责人', content_lead: '内容负责人',
  content_member: '内容成员', ad_member: '投放成员', client_viewer: '客户访客',
  member: '普通成员',
};

export default function TeamSettings() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [members, setMembers] = useState(mockMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const handleInvite = () => {
    if (!inviteEmail) return;
    setMembers([...members, { id: String(Date.now()), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, avatar: inviteEmail[0].toUpperCase() }]);
    setInviteOpen(false);
    setInviteEmail('');
    enqueueSnackbar('邀请已发送', { variant: 'success' });
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    enqueueSnackbar('成员已移除', { variant: 'info' });
  };

  const handleRoleChange = (id: string, role: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
    enqueueSnackbar('角色已更新', { variant: 'success' });
  };

  return (
    <Box maxWidth={800}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/settings')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>团队设置</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">团队成员</Typography>
                  <Typography variant="body2" color="text.secondary">{members.length} 位成员</Typography>
                </Box>
                <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setInviteOpen(true)}>邀请成员</Button>
              </Box>

              <Table size="small">
                <TableBody>
                  {members.map(m => (
                    <TableRow key={m.id}>
                      <TableCell sx={{ width: 40 }}><Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>{m.avatar}</Avatar></TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}>
                            {Object.entries(roleLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => handleRemove(m.id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>团队信息</Typography>
              <Grid container spacing={2}>
                <Grid size={6}><TextField fullWidth label="团队名称" defaultValue="默认团队" size="small" /></Grid>
                <Grid size={6}><TextField fullWidth label="行业" defaultValue="美妆护肤" size="small" /></Grid>
                <Grid size={12}><TextField fullWidth label="描述" defaultValue="内容策略分析团队" size="small" multiline rows={2} /></Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 2 }}>保存</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>邀请成员</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="邮箱地址" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} margin="normal" placeholder="member@example.com" />
          <FormControl fullWidth margin="normal">
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              {Object.entries(roleLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleInvite} disabled={!inviteEmail}>发送邀请</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
