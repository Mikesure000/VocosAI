import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, CircularProgress,
  Table, TableBody, TableCell, TableRow, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab,
} from '@mui/material';
import {
  ArrowBack, TrendingUp, TrendingDown, AutoAwesome, History, Science, Assessment,
} from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';
import { PageShell } from '../../shared/components/PageShell';

export default function SkillDashboard() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<any[]>([]);
  const [report, setReport] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/ai/skills'),
      apiClient.get('/api/ai/skills/report'),
    ]).then(([s, r]) => { setSkills(s.data); setReport(r.data); }).finally(() => setLoading(false));
  }, []);

  const loadOptimizations = async (skillId: string) => {
    setSelectedSkill(skillId);
    const [opt, met] = await Promise.all([
      apiClient.get(`/api/ai/skills/${skillId}/optimizations`),
      apiClient.get(`/api/ai/skills/${skillId}/metrics`),
    ]);
    setOptimizations(opt.data || []);
    setMetrics(met.data);
  };

  const handleRecordFeedback = async (skillId: string, feedbackType: string) => {
    await apiClient.post('/api/ai/skills/feedback', { taskId: 'demo', agentCode: 'agent-01', skillId, feedbackType, score: feedbackType === 'adopted' ? 5 : 2 });
  };

  if (loading) return <PageShell loading skeleton />;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>Skill 学习引擎</Typography>
      </Box>

      {/* 健康状态 */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: '整体健康度', value: report.overallHealth === 'healthy' ? '健康' : report.overallHealth === 'needs_attention' ? '需关注' : '严重', color: report.overallHealth === 'healthy' ? '#4caf50' : report.overallHealth === 'needs_attention' ? '#ff9800' : '#f44336' },
          { label: '反馈总数', value: report.totalFeedbacks || 0, color: '#2196f3' },
          { label: '表现优秀', value: (report.topPerforming?.length || 0) + ' 个Skill', color: '#4caf50' },
          { label: '需要改进', value: (report.needsImprovement?.length || 0) + ' 个Skill', color: '#ff9800' },
        ].map((c) => (
          <Grid size={{ xs: 6, sm: 3 }} key={c.label}>
            <Card sx={{ borderTop: `3px solid ${c.color}` }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700}>{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Skill 列表" />
        <Tab label="学习闭环" />
        <Tab label="A/B 测试" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <Table size="small">
            <TableBody>
              {skills.map((s) => (
                <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => loadOptimizations(s.id)}>
                  <TableCell>
                    <Chip label={s.type === 'platform' ? '平台' : s.type === 'industry' ? '行业' : s.type === 'goal' ? '目标' : s.type === 'depth' ? '深度' : '输出'} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell><Typography fontWeight={600}>{s.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{s.description}</Typography></TableCell>
                  <TableCell><Chip label={`${s.agentCount} Agents`} size="small" /></TableCell>
                  <TableCell>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleRecordFeedback(s.id, 'adopted'); }}>模拟采纳</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AutoAwesome sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
              持续学习闭环
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" flexWrap="wrap" gap={2} py={3}>
              {['执行 Agent', '收集反馈', '评估效果', '生成建议', '优化 Prompt', '版本管理'].map((step, i) => (
                <Box key={i} textAlign="center">
                  <Box width={100} height={60} bgcolor="action.hover" borderRadius={2} display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="divider">
                    <Typography variant="caption" fontWeight={600}>{step}</Typography>
                  </Box>
                  {i < 5 && <Typography color="primary.main" mt={0.5}>→</Typography>}
                </Box>
              ))}
            </Box>
            <Alert severity="info">
              系统会自动收集每次Agent执行的反馈数据（采纳/编辑/重生成），按Skill维度聚合评估，生成优化建议。
              管理员可以查看建议并一键应用优化，系统会自动创建新版本并支持回滚。
            </Alert>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Science sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
              A/B 测试
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              对同一个Agent创建两个版本的Prompt（A版本和B版本），随机分配给不同任务，对比效果后自动选择更优版本。
            </Typography>
            <Button variant="outlined" startIcon={<Science />}>创建 A/B 测试</Button>
          </CardContent>
        </Card>
      )}

      {/* 优化建议弹窗 */}
      {selectedSkill && (
        <Box mt={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">优化建议 — {selectedSkill}</Typography>
                <Button onClick={() => setSelectedSkill(null)}>关闭</Button>
              </Box>
              {metrics && (
                <Grid container spacing={2} mb={2}>
                  {[
                    { label: '采纳率', value: `${metrics.adoptionRate}%`, color: metrics.adoptionRate >= 70 ? '#4caf50' : '#f44336' },
                    { label: '编辑率', value: `${metrics.editRate}%`, color: metrics.editRate <= 20 ? '#4caf50' : '#ff9800' },
                    { label: '重生成率', value: `${metrics.regenerationRate}%`, color: metrics.regenerationRate <= 10 ? '#4caf50' : '#f44336' },
                    { label: '平均评分', value: `${metrics.averageScore}/5`, color: '#2196f3' },
                  ].map((m) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={m.label}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="h5" fontWeight={700} color={m.color}>{m.value}</Typography>
                          <Typography variant="caption">{m.label}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              {optimizations.length === 0 ? (
                <Alert severity="success">此Skill表现良好，暂无优化建议。需要更多反馈数据来生成建议。</Alert>
              ) : (
                optimizations.map((opt, i) => (
                  <Alert key={i} severity={opt.priority === 'high' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{opt.issue}</Typography>
                    <Typography variant="caption" display="block">{opt.reason}</Typography>
                    <Typography variant="caption" display="block" color="success.main">{opt.expectedImprovement}</Typography>
                    <Box mt={1} display="flex" gap={1}>
                      <Button size="small" variant="contained" color="success">应用优化</Button>
                      <Button size="small" variant="outlined">忽略</Button>
                    </Box>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
