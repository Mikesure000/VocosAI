import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Alert,
  TextField, IconButton, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  ArrowBack, ContentCopy, ExpandMore, PushPin, Reply, Chat,
  Campaign, Warning, AutoAwesome,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const opsData = {
  pinned: [
    '很多人问贵在哪里，下一条我们专门拆解成分和效果差异',
    '大家最关心的肤质适配问题，我们整理了一份详细指南',
  ],
  standardReplies: [
    { question: '价格异议', reply: '感谢关注！我们的产品采用XX专利成分，经过XX道工序和XX项检测，效果和安全性都有保障。如果您想了解更多，可以看我们置顶的价值拆解视频哦～' },
    { question: '效果疑问', reply: '产品效果因人而异，一般使用2-4周可以看到明显改善。建议配合正确使用方法，效果更佳。有具体问题可以私信我～' },
    { question: '安全性', reply: '产品通过国家药监局备案，成分安全温和。敏感肌建议先做耳后测试。如有不适请立即停用并咨询医生。' },
    { question: '肤质适配', reply: '产品适合大多数肤质使用。油皮建议清爽用量，干皮可适当增加保湿步骤。不确定的话可以私信我帮你分析～' },
  ],
  negativeReplies: [
    { scenario: '过敏反馈', reply: '非常抱歉给您带来不好的体验！请立即停用并用清水冲洗。每个人的肤质不同，建议先做皮肤测试。如需进一步帮助请私信客服。' },
    { scenario: '效果质疑', reply: '感谢您的反馈！效果确实因人而异，使用周期和手法都会影响。我们愿意为您提供一对一使用指导，私信我聊聊？' },
    { scenario: '价格吐槽', reply: '理解您的感受！我们的产品在成分和工艺上投入较大，但我们会持续优化性价比。您的意见我们会认真反馈给团队！' },
  ],
  dmScripts: [
    '您好！看到您对我们的产品感兴趣，有什么我可以帮您的吗？',
    '感谢您的关注！这边可以给您详细介绍一下产品的成分和适用人群～',
    '您提到的这个问题非常专业，我帮您整理了一份详细的资料，方便查看吗？',
  ],
  interactionQuestions: [
    '你们还想看和哪个产品的对比？评论区告诉我',
    '大家最关心的护肤问题是什么？下期安排',
    '你是什么肤质？用完之后有什么感受？',
  ],
  nextContentHooks: [
    '下一条：深度拆解XX成分，为什么它比平替贵但值得买',
    '粉丝提问最多的问题，一期视频全部回答',
    '不同肤质用XX产品的真实对比，看完再决定',
  ],
  highRisk: [
    { comment: '用了之后脸烂了！千万别买！', action: '立即回复+私信跟进+记录客服工单', level: 'high' },
    { comment: '成分表里有没有激素？', action: '回复成分说明+附检测报告链接', level: 'medium' },
  ],
};

export default function CommentOpsPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('已复制', { variant: 'success' });
  };

  const Section = ({ title, icon, children }: any) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>评论区运营</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<AutoAwesome />}>AI 生成方案</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* 置顶评论 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PushPin color="primary" /><Typography variant="h6">建议置顶评论</Typography>
              </Box>
              {opsData.pinned.map((p, i) => (
                <Box key={i} display="flex" alignItems="start" gap={1} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" flex={1}>{p}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(p)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 标准回复 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Reply color="primary" /><Typography variant="h6">标准回复话术</Typography>
              </Box>
              {opsData.standardReplies.map((s, i) => (
                <Box key={i} mb={2}>
                  <Chip label={s.question} size="small" color="primary" variant="outlined" sx={{ mb: 0.5 }} />
                  <Box display="flex" alignItems="start" gap={1}>
                    <Typography variant="body2" color="text.secondary" flex={1}>{s.reply}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(s.reply)}><ContentCopy fontSize="small" /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 负面回应 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Warning color="warning" /><Typography variant="h6">负面回应话术</Typography>
              </Box>
              {opsData.negativeReplies.map((n, i) => (
                <Box key={i} mb={2}>
                  <Chip label={n.scenario} size="small" color="warning" variant="outlined" sx={{ mb: 0.5 }} />
                  <Box display="flex" alignItems="start" gap={1}>
                    <Typography variant="body2" color="text.secondary" flex={1}>{n.reply}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(n.reply)}><ContentCopy fontSize="small" /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {/* 私信承接 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chat color="info" /><Typography variant="h6">私信承接话术</Typography>
              </Box>
              {opsData.dmScripts.map((d, i) => (
                <Box key={i} display="flex" alignItems="start" gap={1} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="body2" flex={1}>{d}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(d)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 二次互动问题 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Campaign color="success" /><Typography variant="h6">二次互动问题</Typography>
              </Box>
              {opsData.interactionQuestions.map((q, i) => (
                <Box key={i} display="flex" alignItems="start" gap={1} mb={1}>
                  <Typography variant="body2" flex={1}>💬 {q}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(q)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 下一条内容引导 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AutoAwesome color="secondary" /><Typography variant="h6">下一条内容引导</Typography>
              </Box>
              {opsData.nextContentHooks.map((h, i) => (
                <Box key={i} display="flex" alignItems="start" gap={1} mb={1} p={1} bgcolor="secondary.light" borderRadius={1} color="secondary.contrastText">
                  <Typography variant="body2" flex={1} fontWeight={600}>{h}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(h)}><ContentCopy fontSize="small" /></IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* 高风险评论处理 */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Warning color="error" /><Typography variant="h6">高风险评论处理</Typography>
              </Box>
              {opsData.highRisk.map((r, i) => (
                <Alert key={i} severity={r.level === 'high' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{r.comment}</Typography>
                  <Typography variant="caption">{r.action}</Typography>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
