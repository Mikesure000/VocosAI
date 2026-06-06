import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, List, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import { Person, Api, Security, Notifications, Group } from '@mui/icons-material';
import { useAuthStore } from '../../shared/stores/authStore';

export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <Box maxWidth={700}>
      <Typography variant="h4" fontWeight={700} mb={3}>设置</Typography>

      <Grid container spacing={3}>
        {/* 导航 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <List>
              <ListItemButton selected>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="个人信息" />
              </ListItemButton>
              <ListItemButton onClick={() => navigate('/settings/ai')}>
                <ListItemIcon><Api /></ListItemIcon>
                <ListItemText primary="AI 设置" />
              </ListItemButton>
              <ListItemButton onClick={() => navigate('/settings/team')}>
                <ListItemIcon><Group /></ListItemIcon>
                <ListItemText primary="团队设置" />
              </ListItemButton>
              <ListItemButton disabled>
                <ListItemIcon><Security /></ListItemIcon>
                <ListItemText primary="安全设置" />
              </ListItemButton>
              <ListItemButton disabled>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText primary="通知设置" />
              </ListItemButton>
            </List>
          </Card>
        </Grid>

        {/* 内容 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
              <TextField fullWidth label="姓名" defaultValue={user?.name} margin="normal" />
              <TextField fullWidth label="邮箱" defaultValue={user?.email} margin="normal" disabled />
              <TextField fullWidth label="手机号" defaultValue={user?.phone} margin="normal" />
              <Button variant="contained" sx={{ mt: 2 }}>保存修改</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Inline Grid component
function Grid({ children, ...props }: any) {
  const { size, ...rest } = props;
  if (typeof size === 'object') {
    return (
      <Box sx={{ width: { xs: '100%', md: `${(size.md / 12) * 100}%` }, p: 1.5 }}>
        {children}
      </Box>
    );
  }
  return <Box sx={{ p: 1.5, ...rest }}>{children}</Box>;
}
