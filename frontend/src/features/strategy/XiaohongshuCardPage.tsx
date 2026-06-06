import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Alert, IconButton,
} from '@mui/material';
import { ArrowBack, ContentCopy, AutoAwesome, Bookmark, ThumbUp } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const mockCard = {
  cardId: 'CARD-XHS-001', platform: 'xiaohongshu',
  contentGoal: '分肤质使用教程，提升收藏和种草转化',
  targetUser: '油皮/干皮/敏感肌用户，对产品适配有疑问',
  userPainPoint: '不确定产品是否适合自己肤质',
  commentEvidence: ['适合油皮吗？', '敏感肌能用吗？', '干皮会不会干？'],
  coreJudgment: '分肤质教程可覆盖最大的信息缺口',
  titleOptions: [
    '油皮怎么用？干皮怎么用？一篇讲清楚',
    '混油皮的真实使用感受，看完再决定',
    '不同肤质用它效果差多少？真实对比来了',
  ],
  coverText: '油皮 vs 干皮 使用全攻略',
  coreKeywords: ['肤质', '使用方法', '真实感受', '油皮', '干皮', '敏感肌'],
  searchLayout: '布局"油皮+产品名""干皮+产品名""敏感肌+产品名"等长尾关键词',
  bodyStructure: ['开头：肤质自测引导（你是哪种肤质？）', '中段：分肤质步骤详解（油皮版/干皮版/敏感肌版）', '结尾：常见问题Q&A + 收藏引导'],
  noteType: '图文教程 + 收藏清单',
  collectionPoints: ['肤质自测清单', '分肤质使用步骤表', '搭配产品推荐'],
  materialNeeds: ['肤质对比图', '使用步骤图', '前后对比图'],
  sellingPoints: '不同肤质的不同效果展示',
  proofMechanism: '28天真实使用记录 + 周期对比照片',
  interactionQuestions: ['你是什么肤质？', '还有其他使用问题吗？评论区告诉我'],
  cta: '收藏这篇，下次不知道怎么用就翻出来看',
  avoidanceTips: ['不要只说"适合所有肤质"', '不要忽略敏感肌的特殊需求', '不要过度承诺效果'],
  acceptanceCriteria: ['必须有分肤质具体步骤', '必须有真实使用场景照片', '必须有Q&A互动环节'],
  verificationMetrics: ['收藏率 > 5%', '评论互动率 > 3%', '私信咨询转化', '笔记涨粉数'],
};

export default function XiaohongshuCardPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const c = mockCard;
  const copy = (t: string) => { navigator.clipboard.writeText(t); enqueueSnackbar('已复制', { variant: 'success' }); };

  const F = ({ label, children }: any) => (
    <Box mb={1.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
      <Box mt={0.5}>{children}</Box>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>小红书内容生产卡</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<AutoAwesome />}>AI 生成</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" gap={1} mb={1}><Chip label="P1" color="warning" size="small" sx={{ fontWeight: 700 }} /><Chip label="小红书" size="small" variant="outlined" /><Chip label={c.cardId} size="small" variant="outlined" /></Box>
              <F label="内容目标"><Typography fontWeight={600}>{c.contentGoal}</Typography></F>
              <F label="核心判断"><Alert severity="info" sx={{ py: 0 }}>{c.coreJudgment}</Alert></F>
              <F label="评论证据">{c.commentEvidence.map((e, i) => <Chip key={i} label={`"${e}"`} size="small" variant="outlined" sx={{ mr: 0.5 }} />)}</F>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>标题 + 封面</Typography>
              {c.titleOptions.map((t, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" flex={1} fontWeight={i === 0 ? 700 : 400}>{i + 1}. {t}</Typography>
                  <IconButton size="small" onClick={() => copy(t)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
              <F label="封面文案"><Chip icon={<Bookmark />} label={c.coverText} color="secondary" /></F>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>关键词 + 搜索布局</Typography>
              <F label="核心关键词">{c.coreKeywords.map((k, i) => <Chip key={i} label={k} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}</F>
              <F label="搜索词布局"><Typography variant="body2">{c.searchLayout}</Typography></F>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>正文结构 + 笔记类型</Typography>
              <F label="正文结构">{c.bodyStructure.map((s, i) => <Chip key={i} label={`${i + 1}. ${s}`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}</F>
              <F label="笔记类型"><Chip label={c.noteType} color="primary" /></F>
              <F label="收藏点设计">{c.collectionPoints.map((p, i) => <Chip key={i} label={p} size="small" sx={{ mr: 0.5 }} />)}</F>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>CTA + 避坑 + 验收</Typography>
              <F label="CTA"><Chip icon={<ThumbUp />} label={c.cta} color="primary" /></F>
              <F label="互动问题"><Typography variant="body2">{c.interactionQuestions.join(' | ')}</Typography></F>
              <F label="避坑提醒">{c.avoidanceTips.map((t, i) => <Alert key={i} severity="warning" sx={{ py: 0, mb: 0.5 }}>{t}</Alert>)}</F>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>素材 + 卖点</Typography>
              <F label="素材需求">{c.materialNeeds.map((m, i) => <Chip key={i} label={m} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}</F>
              <F label="卖点表达"><Typography variant="body2">{c.sellingPoints}</Typography></F>
              <F label="证明机制"><Typography variant="body2">{c.proofMechanism}</Typography></F>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>验收 + 验证指标</Typography>
              <F label="验收标准">{c.acceptanceCriteria.map((a, i) => <Box key={i} display="flex" gap={1}><Chip label="✓" size="small" color="success" /><Typography variant="body2">{a}</Typography></Box>)}</F>
              <F label="验证指标">{c.verificationMetrics.map((m, i) => <Chip key={i} label={m} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}</F>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
