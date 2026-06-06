import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  CircularProgress, Table, TableBody, TableCell, TableRow, TableHead,
  TablePagination, FormControl, Select, MenuItem,
} from '@mui/material';
import { ArrowBack, Star, StarBorder, FilterList } from '@mui/icons-material';
import { taskApi } from '../../shared/api/task.api';
import CommentDetailDrawer from '../comments/CommentDetailDrawer';

const typeMap: Record<string, string> = {
  purchase_intent: '购买意图', price_objection: '价格异议', competitor_comparison: '竞品比较',
  usage_question: '使用疑问', scenario_need: '场景需求', effect_skepticism: '效果怀疑',
  safety_concern: '安全担忧', repurchase_signal: '复购信号', audience_fit: '人群适配',
  ingredient_focus: '成分关注', trust_gap: '信任缺口', negative_experience: '负面体验',
};

export default function HighValuePage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [scoreFilter, setScoreFilter] = useState('4');
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    taskApi.getComments(taskId!, { page: page + 1, pageSize, valueScore: scoreFilter })
      .then((res) => { setComments(res.data.comments); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [taskId, page, pageSize, scoreFilter]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>高价值评论库</Typography>
      </Box>
      <Card>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} pt={2}>
          <Box display="flex" gap={1} alignItems="center">
            <FilterList fontSize="small" />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={scoreFilter} onChange={(e) => { setScoreFilter(e.target.value); setPage(0); }}>
                <MenuItem value="5">5分</MenuItem>
                <MenuItem value="4">≥4分</MenuItem>
                <MenuItem value="3">≥3分</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary">共 {total} 条</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>评分</TableCell>
              <TableCell>评论内容</TableCell>
              <TableCell sx={{ width: 150 }}>信号标签</TableCell>
              <TableCell sx={{ width: 60 }}>点赞</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((c) => {
              let signals: string[] = [];
              try { signals = JSON.parse(c.signalLabels || '[]'); } catch {}
              return (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailId(c.id)}>
                  <TableCell>
                    <Box display="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        i < c.valueScore ? <Star key={i} sx={{ fontSize: 14, color: '#ff9800' }} /> : <StarBorder key={i} sx={{ fontSize: 14, color: '#ccc' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>{c.commentText}</Typography>
                  </TableCell>
                  <TableCell>
                    {signals.slice(0, 2).map((s) => (
                      <Chip key={s} label={typeMap[s] || s} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {signals.length > 2 && <Chip label={`+${signals.length - 2}`} size="small" />}
                  </TableCell>
                  <TableCell>{c.likeCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize} onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
          labelRowsPerPage="每页" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
      <CommentDetailDrawer commentId={detailId} onClose={() => setDetailId(null)} />
    </Box>
  );
}
