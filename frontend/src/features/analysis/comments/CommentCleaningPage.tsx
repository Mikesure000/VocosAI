import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  CircularProgress, LinearProgress, Alert, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { ArrowBack, CheckCircle, Warning, Delete, FilterList } from '@mui/icons-material';
import { apiClient } from '../../../shared/api/client';

export default function CommentCleaningPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [replyChains, setReplyChains] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get(`/api/tasks/${taskId}/comment-cleaning`),
      apiClient.get(`/api/tasks/${taskId}/reply-chains`),
    ]).then(([d, r]) => { setData(d.data); setReplyChains(r.data); }).finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  if (!data) return <Typography>暂无数据</Typography>;

  const metrics = [
    { label: '原始评论数', value: data.originalCount, color: '#666' },
    { label: '标准化成功', value: data.normalizedSuccess, color: '#4caf50' },
    { label: '精确重复', value: data.exactDuplicates, color: '#f44336' },
    { label: '模糊重复', value: data.fuzzyDuplicates, color: '#ff9800' },
    { label: '水军/无效', value: data.spamCount, color: '#f44336' },
    { label: '引流评论', value: data['引流Count'], color: '#9c27b0' },
    { label: '有效评论', value: data.validCount, color: '#2196f3', highlight: true },
    { label: '回复链数量', value: data.replyChainCount, color: '#00bcd4' },
    { label: '高价值评论', value: data.highValueCount, color: '#4caf50', highlight: true },
    { label: '高购买意图', value: data.highPurchaseIntentCount, color: '#ff5722' },
    { label: '高风险负面', value: data.highRiskNegativeCount, color: '#f44336' },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>评论清洗</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        系统不会简单删除所有短评论。以下类型的短评论会被保留：求链接、怎么买、多少钱、贵、有用吗、适合我吗、在哪买
      </Alert>

      {/* Metrics Grid */}
      <Grid container spacing={2} mb={3}>
        {metrics.map((m) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={m.label}>
            <Card sx={{ borderLeft: `4px solid ${m.color}`, bgcolor: m.highlight ? 'action.hover' : undefined }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{m.value.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reply Chain Analysis */}
      {replyChains && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>回复链分析</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              共 {replyChains.totalThreads} 条回复链，最大深度 {replyChains.maxDepth} 层
            </Typography>
            <Grid container spacing={2} mb={2}>
              {Object.entries(replyChains.threadDistribution || {}).map(([k, v]) => (
                <Grid size={{ xs: 4, sm: 2 }} key={k}>
                  <Box textAlign="center" p={1} bgcolor="action.hover" borderRadius={1}>
                    <Typography variant="h6">{v as number}</Typography>
                    <Typography variant="caption" color="text.secondary">{k.replace('depth', '')}层深</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" gutterBottom fontWeight={600}>争议链</Typography>
            {replyChains.controversyChains?.map((chain: any, i: number) => (
              <Alert key={i} severity={chain.riskLevel === 'high' ? 'error' : chain.riskLevel === 'medium' ? 'warning' : 'info'} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>{chain.topic}</Typography>
                <Typography variant="caption">根评论: "{chain.rootComment}"</Typography>
                <Typography variant="caption" display="block">参与 {chain.participants} 人，{chain.replies} 条回复</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{chain.summary}</Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
