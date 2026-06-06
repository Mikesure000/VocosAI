import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  TextField, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  Divider, IconButton,
} from '@mui/material';
import { ArrowBack, Send, Add, PersonAdd } from '@mui/icons-material';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export default function CollaborationPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: '张三', avatar: 'Z', text: '策略卡P0的内容方向很好，建议本周优先执行', time: '10分钟前' },
    { id: '2', user: '李四', avatar: 'L', text: '投流评分偏低，需要先补充价值解释内容再投', time: '30分钟前' },
    { id: '3', user: '王五', avatar: 'W', text: '抖音生产卡的标题方案B测试效果更好', time: '2小时前' },
  ]);

  const members = [
    { name: '张三', role: '内容负责人', avatar: 'Z', online: true },
    { name: '李四', role: '投放负责人', avatar: 'L', online: true },
    { name: '王五', role: '编导', avatar: 'W', online: false },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setComments([{ id: String(Date.now()), user: '我', avatar: '我', text: message, time: '刚刚' }, ...comments]);
    setMessage('');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>团队协作</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>讨论区</Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField fullWidth size="small" placeholder="输入评论..."
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                <Button variant="contained" onClick={handleSend}><Send /></Button>
              </Box>
              <List>
                {comments.map((c) => (
                  <Box key={c.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>{c.avatar}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box display="flex" gap={1}><Typography variant="body2" fontWeight={600}>{c.user}</Typography><Typography variant="caption" color="text.disabled">{c.time}</Typography></Box>}
                        secondary={c.text}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">团队成员</Typography>
                <IconButton size="small"><PersonAdd /></IconButton>
              </Box>
              {members.map((m) => (
                <Box key={m.name} display="flex" alignItems="center" gap={1} py={1}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>{m.avatar}</Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                  </Box>
                  <Chip label={m.online ? '在线' : '离线'} size="small" color={m.online ? 'success' : 'default'} variant="outlined" />
                </Box>
              ))}
              <Button startIcon={<Add />} size="small" sx={{ mt: 1 }}>邀请成员</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>任务分配</Typography>
              <List dense>
                <ListItem><ListItemText primary="P0策略卡 — 分配给张三" secondary="待执行" /></ListItem>
                <ListItem><ListItemText primary="抖音生产卡 — 分配给王五" secondary="进行中" /></ListItem>
                <ListItem><ListItemText primary="投流测试 — 分配给李四" secondary="待审核" /></ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
