import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';
import { apiClient } from '../../shared/api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ backgroundColor: 'background.default' }}>
      <Card sx={{ p: 4, width: 400, maxWidth: '90vw' }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          注册 VocosAI
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          创建账号开始使用
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="姓名" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required />
          <TextField fullWidth label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
          <TextField fullWidth label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
            {loading ? '注册中...' : '注册'}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center">
          已有账号？<Link to="/login" style={{ color: 'inherit' }}>登录</Link>
        </Typography>
      </Card>
    </Box>
  );
}
