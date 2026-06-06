import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Alert,
  Divider, IconButton, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import { ArrowBack, CheckCircle, ContentCopy, AutoAwesome, ThumbUp } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const mockCard = {
  cardId: 'CARD-DY-001',
  platform: 'douyin',
  contentGoal: '解决价格异议，提高转化信任',
  targetUser: '对产品感兴趣但觉得价格偏高的人群',
  userPainPoint: '不理解产品价值来源',
  commentEvidence: ['这个和几十块的有什么区别？', '贵在哪里？', '是不是智商税？'],
  coreJudgment: '用户不是嫌贵，是不理解价值来源',
  contentDirection: '做一条"贵在哪里"的价值拆解视频',
  titleOptions: [
    '它凭什么比平替贵？看完这3点再决定',
    '评论区都在问贵在哪里，我一次讲清楚',
    '几十块平替和它到底差在哪？',
  ],
  hook: '评论区都在问：它到底凭什么比几十块的贵？',
  structure: ['展示评论质疑', '承认疑问合理', '拆解3个差异', '展示真实反馈', '说明适合人群', '引导评论'],
  scriptOutline: '开头（0-3秒）：评论区截图+大字"贵在哪里？"\n中段（3-45秒）：成分对比→工艺差异→效果数据→用户反馈\n结尾（45-60秒）：总结3个核心差异+引导评论',
  materialNeeds: ['评论截图', '产品对比图', '成分对比表', '用户反馈截图'],
  sellingPoints: '3个核心差异：成分浓度高30%、使用周期短50%、安全认证多3项',
  proofMechanism: '对比实验数据 + 真实用户28天前后对比',
  cta: '你觉得最需要对比哪一点？评论区告诉我',
  commentGuide: '引导用户评论下一个想看的对比对象',
  adFitSuggestion: '适合小预算测试，建议测试3版开头',
  acceptanceCriteria: ['必须直接回应价格质疑', '必须有具体对比数据', '不能只说"高级品质好"', '必须明确适合人群'],
  verificationMetrics: ['CTR > 3%', '商品点击率 > 2%', '价格异议评论占比下降', 'CVR > 1.5%'],
};

export default function DouyinCardPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const c = mockCard;

  const copy = (text: string) => { navigator.clipboard.writeText(text); enqueueSnackbar('已复制', { variant: 'success' }); };
  const copyAll = () => { copy(JSON.stringify(c, null, 2)); };

  const Field = ({ label, children }: any) => (
    <Box mb={1.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
      <Box mt={0.5}>{children}</Box>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>抖音内容生产卡</Typography>
        <Box flex={1} />
        <Button variant="outlined" startIcon={<ContentCopy />} onClick={copyAll}>复制全部</Button>
        <Button variant="contained" startIcon={<AutoAwesome />}>AI 生成</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          {/* 核心信息 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                <Box><Chip label="P0" color="error" size="small" sx={{ fontWeight: 700 }} /><Chip label="抖音" size="small" variant="outlined" sx={{ ml: 1 }} /></Box>
                <Chip label={c.cardId} size="small" variant="outlined" />
              </Box>
              <Field label="内容目标"><Typography variant="body1" fontWeight={600}>{c.contentGoal}</Typography></Field>
              <Field label="目标用户"><Typography variant="body1">{c.targetUser}</Typography></Field>
              <Field label="核心判断"><Alert severity="info" sx={{ py: 0 }}>{c.coreJudgment}</Alert></Field>
              <Field label="评论证据">{c.commentEvidence.map((e: string, i: number) => <Chip key={i} label={`"${e}"`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}</Field>
            </CardContent>
          </Card>

          {/* 标题版本 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>标题版本</Typography>
              {c.titleOptions.map((t, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" flex={1} fontWeight={i === 0 ? 700 : 400}>{i + 1}. {t}</Typography>
                  <IconButton size="small" onClick={() => copy(t)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 脚本结构 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>前3秒钩子 + 脚本结构</Typography>
              <Alert severity="success" sx={{ mb: 1, py: 0 }}><Typography variant="body2" fontWeight={600}>{c.hook}</Typography></Alert>
              <Field label="内容结构">
                {c.structure.map((s, i) => <Chip key={i} label={`${i + 1}. ${s}`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}
              </Field>
              <Field label="脚本大纲">
                <Box p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{c.scriptOutline}</Typography>
                </Box>
              </Field>
            </CardContent>
          </Card>

          {/* 素材 + 卖点 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>素材需求 + 卖点</Typography>
              <Field label="素材需求">{c.materialNeeds.map((m, i) => <Chip key={i} label={m} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}</Field>
              <Field label="卖点表达"><Typography variant="body2">{c.sellingPoints}</Typography></Field>
              <Field label="证明机制"><Typography variant="body2">{c.proofMechanism}</Typography></Field>
            </CardContent>
          </Card>

          {/* CTA + 验收 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>CTA + 验收标准</Typography>
              <Field label="CTA"><Chip icon={<ThumbUp />} label={c.cta} color="primary" /></Field>
              <Field label="评论引导"><Typography variant="body2">{c.commentGuide}</Typography></Field>
              <Field label="验收标准">
                {c.acceptanceCriteria.map((a, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1}><CheckCircle color="success" fontSize="small" /><Typography variant="body2">{a}</Typography></Box>
                ))}
              </Field>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>投流建议</Typography>
              <Typography variant="body2">{c.adFitSuggestion}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>发布后验证指标</Typography>
              {c.verificationMetrics.map((m, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={0.5}><CheckCircle color="primary" fontSize="small" /><Typography variant="body2">{m}</Typography></Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
