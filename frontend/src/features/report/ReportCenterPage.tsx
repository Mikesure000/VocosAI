import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, List, ListItem, ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { ArrowBack, Add, FileDownload, Share, Delete, Preview } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';
import { useSnackbar } from 'notistack';

interface Report {
  id: string;
  taskId: string;
  reportType: string;
  reportTitle: string;
  version: number;
  status: string;
  createdAt: string;
}

export default function ReportCenterPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [shareDialog, setShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const loadReports = () => {
    apiClient.get(`/api/tasks/${taskId}/reports`).then((res) => setReports(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [taskId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post(`/api/tasks/${taskId}/reports/generate`, { reportType: 'full', reportTitle: '分析报告' });
      setReports((prev) => [res.data, ...prev]);
      enqueueSnackbar('报告生成成功', { variant: 'success' });
    } catch {
      enqueueSnackbar('报告生成失败', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!selectedReport) return;
    try {
      const res = await apiClient.post(`/api/reports/${selectedReport.id}/export`, { format: exportFormat });
      enqueueSnackbar(`导出成功: ${res.data.fileName}`, { variant: 'success' });
      setExportDialog(false);
    } catch {
      enqueueSnackbar('导出失败', { variant: 'error' });
    }
  };

  const handleShare = async (report: Report) => {
    try {
      const res = await apiClient.post(`/api/reports/${report.id}/share`);
      setShareUrl(`${window.location.origin}/share/${res.data.shareToken}`);
      setShareDialog(true);
    } catch {
      enqueueSnackbar('分享链接生成失败', { variant: 'error' });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  const formats = [
    { value: 'markdown', label: 'Markdown' },
    { value: 'pdf', label: 'PDF' },
    { value: 'word', label: 'Word' },
    { value: 'excel', label: 'Excel' },
    { value: 'html', label: 'HTML 分享' },
    { value: 'ppt', label: 'PPT' },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>报告中心</Typography>
        <Box flex={1} />
        <Button variant="contained" startIcon={<Add />} onClick={handleGenerate} disabled={generating}>
          {generating ? '生成中...' : '生成报告'}
        </Button>
      </Box>

      {reports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">暂无报告</Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>点击"生成报告"创建分析报告</Typography>
            <Button variant="contained" onClick={handleGenerate}>生成报告</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {reports.map((report) => (
            <Grid size={{ xs: 12 }} key={report.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{report.reportTitle}</Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip label={`v${report.version}`} size="small" variant="outlined" />
                        <Chip label={report.reportType === 'full' ? '完整报告' : report.reportType} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(report.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Preview />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/reports/${report.id}`)}>
                        预览
                      </Button>
                      <Button size="small" startIcon={<FileDownload />} onClick={() => { setSelectedReport(report); setExportDialog(true); }}>
                        导出
                      </Button>
                      <Button size="small" startIcon={<Share />} onClick={() => handleShare(report)}>
                        分享
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>导出报告</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="导出格式"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            margin="normal"
          >
            {formats.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleExport}>导出</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>分享报告</DialogTitle>
        <DialogContent>
          <TextField fullWidth value={shareUrl} label="分享链接" margin="normal" InputProps={{ readOnly: true }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => { navigator.clipboard.writeText(shareUrl); enqueueSnackbar('已复制到剪贴板', { variant: 'success' }); }}
          >
            复制链接
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
