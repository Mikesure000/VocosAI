import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

export default function ReportPreview() {
  const { id: projectId, taskId, reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/api/reports/${reportId}`).then((res) => setReport(res.data)).finally(() => setLoading(false));
  }, [reportId]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  if (!report) return <Typography>报告不存在</Typography>;

  // Simple markdown rendering
  const renderMarkdown = (md: string) => {
    if (!md) return <Typography color="text.secondary">暂无内容</Typography>;
    const lines = md.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <Typography key={i} variant="h4" fontWeight={700} mt={2} mb={1}>{line.slice(2)}</Typography>;
      if (line.startsWith('## ')) return <Typography key={i} variant="h5" fontWeight={600} mt={2} mb={1} color="primary.main">{line.slice(3)}</Typography>;
      if (line.startsWith('### ')) return <Typography key={i} variant="h6" fontWeight={600} mt={1.5} mb={0.5}>{line.slice(4)}</Typography>;
      if (line.startsWith('> ')) return <Typography key={i} variant="body2" color="text.secondary" sx={{ borderLeft: '3px solid #16a34a', pl: 2, py: 0.5, my: 0.5 }}>{line.slice(2)}</Typography>;
      if (line.startsWith('---')) return <Box key={i} sx={{ borderTop: '1px solid', borderColor: 'divider', my: 2 }} />;
      if (line.startsWith('- ')) return <Typography key={i} variant="body2" sx={{ pl: 2 }}>• {line.slice(2)}</Typography>;
      if (line.startsWith('|')) return null; // Skip tables for simple render
      if (line.trim()) return <Typography key={i} variant="body2" sx={{ my: 0.5 }}>{line}</Typography>;
      return <Box key={i} sx={{ height: 8 }} />;
    });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/reports`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>{report.reportTitle}</Typography>
      </Box>
      <Card>
        <CardContent sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
          {renderMarkdown(report.markdownContent)}
        </CardContent>
      </Card>
    </Box>
  );
}
