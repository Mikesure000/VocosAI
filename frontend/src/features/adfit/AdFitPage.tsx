import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  LinearProgress, Alert, List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import { ArrowBack, CheckCircle, Warning, Error, TrendingUp } from '@mui/icons-material';

const dimensions = [
  { label: '人群清晰度', weight: 15, score: 80 },
  { label: '卖点清晰度', weight: 15, score: 65 },
  { label: '购买理由', weight: 15, score: 70 },
  { label: '评论风险', weight: 15, score: 85 },
  { label: '合规风险', weight: 15, score: 90 },
  { label: '素材稳定性', weight: 10, score: 75 },
  { label: '可剪辑复用性', weight: 10, score: 60 },
  { label: '转化承接', weight: 15, score: 55 },
];

export default function AdFitPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();

  const totalScore = Math.round(dimensions.reduce((s, d) => s + d.score * (d.weight / 100), 0));

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>投流适配评分</Typography>
      </Box>

      {/* Score Card */}
      <Card sx={{ mb: 3, textAlign: 'center', py: 3 }}>
        <CardContent>
          <Typography variant="h2" fontWeight={700} color={totalScore >= 70 ? 'success.main' : totalScore >= 50 ? 'warning.main' : 'error.main'}>
            {totalScore}<Typography component="span" variant="h4">/100</Typography>
          </Typography>
          <Chip
            label={totalScore >= 70 ? '建议投流测试' : totalScore >= 50 ? '建议优化后再测' : '不建议投流'}
            color={totalScore >= 70 ? 'success' : totalScore >= 50 ? 'warning' : 'error'}
            sx={{ mt: 1, fontWeight: 600 }}
          />
          <Typography variant="body1" mt={2} color="text.secondary">
            适合小预算测试，不建议直接大预算放量
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Dimension Scores */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>评分维度</Typography>
              {dimensions.map((dim) => (
                <Box key={dim.label} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{dim.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{dim.score}/100 (权重 {dim.weight}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dim.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: dim.score >= 80 ? '#4caf50' : dim.score >= 60 ? '#ff9800' : '#f44336',
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>建议投放人群</Typography>
              <Typography variant="body2">对价格有犹豫但对品质有需求的人群</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>建议测试变量</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="A：价格质疑型开头" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="B：效果证明型开头" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="C：真实评论型开头" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                <Warning fontSize="small" sx={{ mr: 0.5 }} />
                风险提醒
              </Typography>
              <Alert severity="warning" sx={{ mt: 1 }}>
                评论区存在价格异议，投流前需要补充价值解释内容
              </Alert>
              <Typography variant="body2" mt={2}>
                <strong>放量建议：</strong>若小预算测试 CTR、CVR、负面评论率达标，可进入第二轮素材变体测试
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
