import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, CircularProgress,
  IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { ArrowBack, Add, Check, Close, AutoAwesome, Edit, ContentCopy, Share } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { taskApi } from '../../shared/api/task.api';
import { apiClient } from '../../shared/api/client';

const priorityColors: Record<string, string> = { P0: '#f44336', P1: '#ff9800', P2: '#2196f3' };

export default function StrategyCardPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');

  const load = () => {
    taskApi.getStrategyCards(taskId!).then((r) => setCards(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [taskId]);

  const handleGenerate = async () => { setGenerating(true); try { await apiClient.post(`/api/tasks/${taskId}/strategy-cards/generate`); load(); enqueueSnackbar('策略卡生成成功', { variant: 'success' }); } finally { setGenerating(false); } };

  const handleStatus = async (cardId: string, status: string) => { await apiClient.put(`/api/tasks/${taskId}/strategy-cards/${cardId}`, { status }); load(); enqueueSnackbar(status === 'adopted' ? '已采纳' : '已拒绝', { variant: status === 'adopted' ? 'success' : 'info' }); };

  const handleEdit = (card: any) => { setEditCard(card); setEditTitle(card.title); setEditDialog(true); };

  const handleSaveEdit = async () => { if (!editCard) return; await apiClient.put(`/api/tasks/${taskId}/strategy-cards/${editCard.id}`, { title: editTitle, cardJson: editCard.cardJson }); setEditDialog(false); load(); enqueueSnackbar('已保存', { variant: 'success' }); };

  const handleCopy = (card: any) => { const parsed = JSON.parse(card.cardJson || '{}'); navigator.clipboard.writeText(`${card.priority} ${card.title}\n${parsed.contentOpportunity || ''}\n下一步: ${parsed.nextAction || ''}`); enqueueSnackbar('已复制', { variant: 'success' }); };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>策略卡中心</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<AutoAwesome />} onClick={handleGenerate} disabled={generating}>{generating ? '生成中...' : 'AI 生成策略卡'}</Button>
      </Box>

      {cards.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">暂无策略卡</Typography>
          <Button variant="contained" sx={{ mt: 2 }} startIcon={<AutoAwesome />} onClick={handleGenerate}>生成策略卡</Button>
        </CardContent></Card>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => {
            const parsed = (() => { try { return JSON.parse(card.cardJson || '{}'); } catch { return {}; } })();
            return (
              <Grid size={{ xs: 12, md: 6 }} key={card.id}>
                <Card sx={{ borderLeft: `4px solid ${priorityColors[card.priority] || '#999'}`, opacity: card.status === 'rejected' ? 0.5 : 1 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip label={card.priority} size="small" sx={{ bgcolor: priorityColors[card.priority], color: '#fff', fontWeight: 700 }} />
                        <Chip label={card.status === 'adopted' ? '已采纳' : card.status === 'rejected' ? '已拒绝' : '待审核'} size="small" color={card.status === 'adopted' ? 'success' : card.status === 'rejected' ? 'error' : 'default'} variant="outlined" />
                      </Box>
                      <Box display="flex" gap={0.5}>
                        <IconButton size="small" onClick={() => handleCopy(card)} title="复制"><ContentCopy fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleEdit(card)} title="编辑"><Edit fontSize="small" /></IconButton>
                        {card.status !== 'adopted' && <IconButton size="small" color="success" onClick={() => handleStatus(card.id, 'adopted')} title="采纳"><Check fontSize="small" /></IconButton>}
                        {card.status !== 'rejected' && <IconButton size="small" color="error" onClick={() => handleStatus(card.id, 'rejected')} title="拒绝"><Close fontSize="small" /></IconButton>}
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>{card.title}</Typography>
                    {parsed.contentOpportunity && <Alert severity="info" sx={{ mb: 1, py: 0 }}><Typography variant="body2">{parsed.contentOpportunity}</Typography></Alert>}
                    {parsed.commentEvidence?.length > 0 && (
                      <Box mb={1}>{parsed.commentEvidence.slice(0, 3).map((e: string, i: number) => <Chip key={i} label={`"${e}"`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}</Box>
                    )}
                    <Grid container spacing={1}>
                      {parsed.suggestedPlatform && <Grid size={6}><Typography variant="caption" color="text.secondary">建议平台</Typography><Typography variant="body2" fontWeight={600}>{parsed.suggestedPlatform === 'douyin' ? '抖音' : parsed.suggestedPlatform === 'xiaohongshu' ? '小红书' : parsed.suggestedPlatform}</Typography></Grid>}
                      {parsed.contentFormat && <Grid size={6}><Typography variant="caption" color="text.secondary">内容形式</Typography><Typography variant="body2" fontWeight={600}>{parsed.contentFormat}</Typography></Grid>}
                      {parsed.nextAction && <Grid size={12}><Box mt={1} p={1} bgcolor="action.hover" borderRadius={1}><Typography variant="body2" fontWeight={600}>下一步：{parsed.nextAction}</Typography></Box></Grid>}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑策略卡</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="标题" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} margin="normal" />
          <TextField fullWidth label="Card JSON" value={editCard?.cardJson || ''} onChange={(e) => setEditCard({ ...editCard, cardJson: e.target.value })} margin="normal" multiline rows={8} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleSaveEdit}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
