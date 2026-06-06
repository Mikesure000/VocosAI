import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  CircularProgress, LinearProgress, Alert, Table, TableBody,
  TableCell, TableRow, TableHead, FormControl, Select, MenuItem,
} from '@mui/material';
import { CloudUpload, ArrowBack, ArrowForward, CheckCircle, Warning } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiClient } from '../../shared/api/client';

const STANDARD_FIELD_OPTIONS = [
  { value: 'comment_id', label: '评论ID' },
  { value: 'comment_text', label: '评论内容 ★必选' },
  { value: 'comment_image', label: '评论图片链接' },
  { value: 'like_count', label: '点赞量' },
  { value: 'created_at', label: '评论时间' },
  { value: 'ip_location', label: 'IP地址' },
  { value: 'reply_count', label: '子评论数' },
  { value: 'video_id', label: '视频ID' },
  { value: 'video_url', label: '视频链接' },
  { value: 'user_uid', label: '用户UID' },
  { value: 'user_url', label: '用户链接' },
  { value: 'user_name', label: '用户名称' },
  { value: 'douyin_id', label: '抖音号' },
  { value: 'parent_comment_id', label: '一级评论ID' },
  { value: 'parent_comment_text', label: '一级评论内容' },
  { value: 'parent_user_uid', label: '一级评论用户UID' },
  { value: 'parent_user_name', label: '一级评论用户名称' },
  { value: 'quoted_comment_id', label: '引用的评论ID' },
  { value: 'quoted_comment_text', label: '引用的评论内容' },
  { value: 'quoted_user_uid', label: '引用的用户UID' },
  { value: 'quoted_user_name', label: '引用的用户名称' },
  { value: 'ignore', label: '忽略此列' },
];

export default function FieldMappingPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiClient.post(`/api/tasks/${taskId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setMapping(res.data.mappedColumns || {});
      enqueueSnackbar(`解析完成：${res.data.stats?.total || 0} 条评论`, { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || '上传失败', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmMapping = async () => {
    setConfirming(true);
    try {
      const res = await apiClient.post(`/api/tasks/${taskId}/confirm-mapping`, { mapping });
      enqueueSnackbar(res.data.message, { variant: 'success' });
      navigate(`/projects/${projectId}/tasks/${taskId}/progress`);
    } catch (err: any) {
      enqueueSnackbar('入库失败', { variant: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const hasCommentText = Object.values(mapping).includes('comment_text');

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>上传评论文件</Typography>
      </Box>

      {/* Step 1: Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>1. 选择文件</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            支持 .xlsx / .xls / .csv 格式，单文件最大 50MB。<br />
            标准表头：评论ID | 评论内容 | 点赞量 | 评论时间 | IP地址 | 子评论数 | 视频ID | 视频链接 | 用户UID | 用户链接 | 用户名称 | 抖音号 | 一级评论ID | 一级评论内容 | 一级评论用户UID | 一级评论用户名称 | 引用的评论ID | 引用的评论内容 | 引用的用户UID | 引用的用户名称
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              选择文件
              <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
            {file && <Typography>{file.name} ({(file.size / 1024).toFixed(1)} KB)</Typography>}
          </Box>
          {file && (
            <Button variant="contained" onClick={handleFileUpload} disabled={uploading} sx={{ mt: 2 }}>
              {uploading ? <CircularProgress size={24} /> : '上传并解析'}
            </Button>
          )}
          {uploading && <LinearProgress sx={{ mt: 1 }} />}
        </CardContent>
      </Card>

      {/* Step 2: Results */}
      {result && (
        <>
          {/* Stats */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: '总评论数', value: result.stats?.total, color: '#2196f3' },
              { label: '一级评论', value: result.stats?.topLevel, color: '#4caf50' },
              { label: '回复评论', value: result.stats?.replies, color: '#ff9800' },
              { label: '引用评论', value: result.stats?.quoted, color: '#9c27b0' },
              { label: '有信号', value: result.stats?.withSignals, color: '#00bcd4' },
              { label: '高价值(≥4分)', value: result.stats?.highValue, color: '#f44336' },
              { label: '去重', value: result.stats?.duplicateIds, color: '#607d8b' },
            ].map((s) => (
              <Grid size={{ xs: 6, sm: 3, md: 1.7 }} key={s.label}>
                <Card sx={{ borderLeft: `3px solid ${s.color}` }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Preview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>数据预览（前5条）</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>评论内容</TableCell>
                    <TableCell>点赞</TableCell>
                    <TableCell>信号标签</TableCell>
                    <TableCell>评分</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>清洗状态</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.preview?.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>{p.commentText}</Typography>
                      </TableCell>
                      <TableCell>{p.likeCount}</TableCell>
                      <TableCell>
                        {p.signals?.map((s: string) => <Chip key={s} label={s} size="small" variant="outlined" sx={{ mr: 0.5 }} />)}
                      </TableCell>
                      <TableCell>
                        <Chip label={`${p.valueScore}分`} size="small" color={p.valueScore >= 4 ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={p.isReply ? '回复' : '一级'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={p.cleanStatus} size="small" color={p.cleanStatus === 'valid' ? 'success' : 'warning'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Field Mapping */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>2. 字段映射确认</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                系统已自动识别字段映射，请确认或调整。至少需要映射「评论内容」
              </Typography>
              {!hasCommentText && (
                <Alert severity="error" sx={{ mb: 2 }}>请至少将一列映射为「评论内容」</Alert>
              )}

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>文件列名</TableCell>
                    <TableCell sx={{ width: 220 }}>映射为标准字段</TableCell>
                    <TableCell>映射状态</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.columns?.map((col: string) => {
                    const mapped = mapping[col];
                    const isMapped = mapped && mapped !== 'ignore';
                    const isComment = mapped === 'comment_text';
                    return (
                      <TableRow key={col} sx={{ bgcolor: isComment ? 'success.light' : undefined }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{col}</Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select value={mapped || ''} onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}>
                              <MenuItem value="">-- 未映射 --</MenuItem>
                              {STANDARD_FIELD_OPTIONS.map((f) => (
                                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          {isComment ? (
                            <Chip icon={<CheckCircle />} label="评论内容已映射" color="success" size="small" />
                          ) : isMapped ? (
                            <Chip label="已映射" variant="outlined" size="small" />
                          ) : (
                            <Chip icon={<Warning />} label="未映射" color="warning" size="small" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleConfirmMapping}
                  disabled={!hasCommentText || confirming}
                  size="large"
                >
                  {confirming ? '入库中...' : '确认并开始分析'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
