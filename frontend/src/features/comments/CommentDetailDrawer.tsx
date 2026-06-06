import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Drawer, Box, Typography, Chip, IconButton, CircularProgress,
  Divider, List, ListItem, ListItemText, Avatar, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { Close, Star, Chat, Reply, ThumbUp, LocationOn } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

interface CommentDetailDrawerProps {
  commentId: string | null;
  onClose: () => void;
}

const typeMap: Record<string, string> = {
  purchase_intent: '购买意图', price_objection: '价格异议', competitor_comparison: '竞品比较',
  usage_question: '使用疑问', effect_skepticism: '效果怀疑', safety_concern: '安全担忧',
  repurchase_signal: '复购信号', negative_experience: '负面体验',
};

export default function CommentDetailDrawer({ commentId, onClose }: CommentDetailDrawerProps) {
  const { taskId } = useParams();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!commentId || !taskId) return;
    setLoading(true);
    apiClient.get(`/api/tasks/${taskId}/comments/${commentId}/detail`)
      .then((r) => setDetail(r.data))
      .finally(() => setLoading(false));
  }, [commentId, taskId]);

  if (!commentId) return null;

  return (
    <Drawer anchor="right" open={!!commentId} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">评论详情</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : detail ? (
          <>
            {/* 评论主体 */}
            <Box p={2} bgcolor="action.hover" borderRadius={1} mb={2}>
              <Typography variant="body1">{detail.commentText}</Typography>
              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                <Chip icon={<ThumbUp sx={{ fontSize: 14 }} />} label={detail.likeCount} size="small" variant="outlined" />
                {detail.ipLocation && <Chip icon={<LocationOn sx={{ fontSize: 14 }} />} label={detail.ipLocation} size="small" variant="outlined" />}
                {detail.isReply && <Chip icon={<Reply sx={{ fontSize: 14 }} />} label="回复" size="small" />}
                <Box display="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} sx={{ fontSize: 14, color: i < detail.valueScore ? '#ff9800' : '#ccc' }} />
                  ))}
                </Box>
              </Box>
              {detail.signalLabels?.length > 0 && (
                <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                  {detail.signalLabels.map((s: string) => (
                    <Chip key={s} label={typeMap[s] || s} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>

            {/* 元数据 */}
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                {detail.douyinId && <TableRow><TableCell sx={{ fontWeight: 600, width: 100 }}>抖音号</TableCell><TableCell>{detail.douyinId}</TableCell></TableRow>}
                {detail.ipLocation && <TableRow><TableCell sx={{ fontWeight: 600 }}>IP</TableCell><TableCell>{detail.ipLocation}</TableCell></TableRow>}
                {detail.createdAtExternal && <TableRow><TableCell sx={{ fontWeight: 600 }}>时间</TableCell><TableCell>{new Date(detail.createdAtExternal).toLocaleString()}</TableCell></TableRow>}
                {detail.parentCommentText && <TableRow><TableCell sx={{ fontWeight: 600 }}>一级评论</TableCell><TableCell>{detail.parentCommentText}</TableCell></TableRow>}
                {detail.quotedCommentText && <TableRow><TableCell sx={{ fontWeight: 600 }}>引用评论</TableCell><TableCell>{detail.quotedCommentText}</TableCell></TableRow>}
              </TableBody>
            </Table>

            {/* 回复列表 */}
            {detail.replies?.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle1" mt={2} mb={1} fontWeight={600}>
                  <Reply fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  回复 ({detail.replies.length})
                </Typography>
                {detail.replies.map((r: any) => (
                  <Box key={r.id} p={1} mb={1} bgcolor="action.hover" borderRadius={1}>
                    <Typography variant="body2">{r.commentText}</Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      <Chip icon={<ThumbUp sx={{ fontSize: 12 }} />} label={r.likeCount} size="small" variant="outlined" />
                      {r.signalLabels?.map((s: string) => (
                        <Chip key={s} label={typeMap[s] || s} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </>
            )}

            {/* 被引用列表 */}
            {detail.quotedBy?.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle1" mt={2} mb={1} fontWeight={600}>
                  <Chat fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  被引用 ({detail.quotedBy.length})
                </Typography>
                {detail.quotedBy.map((q: any) => (
                  <Box key={q.id} p={1} mb={1} bgcolor="warning.light" borderRadius={1}>
                    <Typography variant="body2">{q.commentText}</Typography>
                  </Box>
                ))}
              </>
            )}
          </>
        ) : (
          <Typography color="text.secondary">评论不存在</Typography>
        )}
      </Box>
    </Drawer>
  );
}
