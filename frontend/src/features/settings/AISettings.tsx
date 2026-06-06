import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, TextField,
  Chip, CircularProgress, Alert, Switch, FormControlLabel, Divider,
} from '@mui/material';
import { Api, CheckCircle, PowerSettingsNew, AutoAwesome } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';
import { useSnackbar } from 'notistack';

export default function AISettings() {
  const { enqueueSnackbar } = useSnackbar();
  const [settings, setSettings] = useState<any>({});
  const [deepseekKey, setDeepseekKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/api/ai/settings').then((r) => setSettings(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSaveKey = async (provider: string) => {
    const key = provider === 'deepseek' ? deepseekKey : openaiKey;
    if (!key) return;
    setSaving(true);
    try {
      await apiClient.post('/api/ai/settings/key', { provider, apiKey: key });
      enqueueSnackbar(`${provider} API Key 已保存`, { variant: 'success' });
    } catch {
      enqueueSnackbar('保存失败', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await apiClient.post('/api/ai/settings/test', { provider: 'deepseek', model: 'deepseek-v4-flash' });
      setTestResult(res.data);
    } finally {
      setTesting(false);
    }
  };

  const handleToggleMode = async () => {
    const newMode = settings.mode === 'mock' ? 'live' : 'mock';
    await apiClient.post('/api/ai/settings/mode', { mode: newMode });
    setSettings({ ...settings, mode: newMode });
    enqueueSnackbar(`已切换为 ${newMode === 'live' ? '真实调用' : '模拟模式'}`, { variant: 'success' });
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Box maxWidth={800}>
      <Typography variant="h4" fontWeight={700} mb={3}>AI 设置</Typography>

      {/* Mode Switch */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">AI 运行模式</Typography>
              <Typography variant="body2" color="text.secondary">
                模拟模式无需 API Key，使用预置数据测试；真实模式调用 DeepSeek/OpenAI API
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip label={settings.mode === 'live' ? '真实调用' : '模拟模式'}
                color={settings.mode === 'live' ? 'success' : 'default'}
                icon={settings.mode === 'live' ? <PowerSettingsNew /> : <AutoAwesome />} />
              <Button variant="outlined" onClick={handleToggleMode}>
                切换为{settings.mode === 'mock' ? '真实调用' : '模拟模式'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>DeepSeek API</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Base URL: {settings.providers?.find((p: any) => p.providerName === 'deepseek')?.baseUrl || 'https://api.deepseek.com'}
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth size="small" type="password" placeholder="sk-..."
              value={deepseekKey} onChange={(e) => setDeepseekKey(e.target.value)}
              helperText={settings.providers?.find((p: any) => p.providerName === 'deepseek')?.hasKey ? '已配置' : '未配置'}
            />
            <Button variant="contained" onClick={() => handleSaveKey('deepseek')} disabled={!deepseekKey || saving}>
              保存
            </Button>
          </Box>
        </CardContent>
        <Divider />
        <CardContent>
          <Typography variant="h6" gutterBottom>OpenAI API</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Base URL: https://api.openai.com/v1
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth size="small" type="password" placeholder="sk-..."
              value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)}
              helperText={settings.providers?.find((p: any) => p.providerName === 'openai')?.hasKey ? '已配置' : '未配置'}
            />
            <Button variant="contained" onClick={() => handleSaveKey('openai')} disabled={!openaiKey || saving}>
              保存
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>测试连接</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            发送测试请求验证 API 配置是否正确
          </Typography>
          <Button variant="outlined" startIcon={<Api />} onClick={handleTest} disabled={testing}>
            {testing ? '测试中...' : '测试 DeepSeek 连接'}
          </Button>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              <Typography variant="body2">
                {testResult.success ? '连接成功' : '连接失败'}
                {testResult.latencyMs && ` (${testResult.latencyMs}ms)`}
              </Typography>
              {testResult.content && (
                <Typography variant="caption" display="block">{testResult.content.slice(0, 100)}</Typography>
              )}
              {testResult.error && (
                <Typography variant="caption" display="block" color="error">{testResult.error}</Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
