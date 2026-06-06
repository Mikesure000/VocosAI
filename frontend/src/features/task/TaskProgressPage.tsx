import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, LinearProgress, Chip, CircularProgress,
} from '@mui/material';
import { ArrowBack, PlayArrow, CheckCircle, Error as ErrorIcon, AccessTime } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';
import { useAnalysisNotifier } from '../../shared/components/AnalysisNotification';
import { estimateAnalysisTime } from '../../shared/components/QuickActions';

const AGENT_STEPS = [
  { code: 'agent-00', name: '任务理解与目标识别' },
  { code: 'agent-01', name: '原内容拆解' },
  { code: 'agent-02', name: '评论去重清洗' },
  { code: 'agent-03', name: '水军与无效评论过滤' },
  { code: 'agent-04', name: '多轮对话清洗' },
  { code: 'agent-05', name: '情感深度分析' },
  { code: 'agent-06', name: '高价值评论筛选' },
  { code: 'agent-07', name: '用户需求与购买障碍识别' },
  { code: 'agent-08', name: '内容-评论归因' },
  { code: 'agent-09', name: '内容价值类型识别' },
  { code: 'agent-10', name: '平台策略生成' },
  { code: 'agent-11', name: '内容生产卡生成' },
  { code: 'agent-12', name: '评论区运营方案' },
  { code: 'agent-13', name: '投流适配评分' },
  { code: 'agent-14', name: '发布前质检' },
  { code: 'agent-15', name: '报告组装' },
  { code: 'agent-16', name: 'AI 质量评估' },
];

interface StepStatus {
  code: string; name: string; status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
}

export default function TaskProgressPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<StepStatus[]>(AGENT_STEPS.map((s) => ({ ...s, status: 'pending' })));
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { startWatching } = useAnalysisNotifier();
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!started || completed || !taskId) return;
    const es = new EventSource(`/api/tasks/${taskId}/progress-stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.steps) {
          setSteps(data.steps);
          setCurrentStep(data.currentStep);
          if (data.status === 'completed') { setCompleted(true); es.close(); }
          if (data.status === 'failed' || data.status === 'partially_failed') { es.close(); }
        }
      } catch {}
    };

    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [started, completed, taskId]);

  const handleStart = async () => {
    try {
      const res = await apiClient.post(`/api/tasks/${taskId}/start`);
      setStarted(true);
      setCommentCount(res.data.commentCount || 0);
      startWatching(taskId!, projectId!, '分析任务');
      setSteps((prev) => prev.map((s, i) => i === 0 ? { ...s, status: 'running' } : s));
    } catch (err) { console.error(err); }
  };

  const progressPercent = Math.round((currentStep / AGENT_STEPS.length) * 100);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/mapping`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>分析进度</Typography>
        {!started && (
          <Button variant="contained" startIcon={<PlayArrow />} onClick={handleStart} sx={{ ml: 'auto' }}>
            启动 AI 分析
          </Button>
        )}
        {completed && (
          <Button variant="contained" color="success" onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)} sx={{ ml: 'auto' }}>
            查看分析结果
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">总体进度</Typography>
              <Typography variant="body2" fontWeight={600}>{progressPercent}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPercent}
              sx={{ height: 8, borderRadius: 4 }}
              color={completed ? 'success' : 'primary'} />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {started && !completed
                ? <><AccessTime sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />正在执行第 {currentStep}/{AGENT_STEPS.length} 步 · {estimateAnalysisTime(commentCount)}</>
                : completed ? '分析完成' : '点击启动 AI 分析'}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            {steps.map((step, index) => (
              <Box key={step.code} display="flex" alignItems="center" gap={2} py={1.5}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 32, display: 'flex', justifyContent: 'center' }}>
                  {step.status === 'success' && <CheckCircle color="success" fontSize="small" />}
                  {step.status === 'failed' && <ErrorIcon color="error" fontSize="small" />}
                  {step.status === 'running' && <CircularProgress size={20} />}
                  {step.status === 'pending' && (
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />
                  )}
                  {step.status === 'skipped' && <Chip label="跳过" size="small" variant="outlined" />}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={step.status === 'running' ? 600 : 400}>
                    {index + 1}. {step.name}
                  </Typography>
                </Box>
                <Chip
                  label={
                    step.status === 'pending' ? '等待中' : step.status === 'running' ? '执行中' :
                    step.status === 'success' ? '完成' : step.status === 'failed' ? '失败' : '跳过'
                  }
                  size="small"
                  color={
                    step.status === 'success' ? 'success' : step.status === 'running' ? 'info' :
                    step.status === 'failed' ? 'error' : 'default'
                  }
                  variant={step.status === 'pending' ? 'outlined' : 'filled'}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
