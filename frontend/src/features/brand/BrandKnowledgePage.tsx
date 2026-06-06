import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  TextField, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ArrowBack, ExpandMore, Add, Save } from '@mui/icons-material';

export default function BrandKnowledgePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/brands')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>品牌知识库</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">品牌信息</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={6}><TextField fullWidth label="品牌名称" defaultValue="完美日记" size="small" /></Grid>
                <Grid size={6}><TextField fullWidth label="行业" defaultValue="美妆护肤" size="small" /></Grid>
                <Grid size={12}><TextField fullWidth label="品牌定位" defaultValue="新锐国货美妆品牌" size="small" multiline rows={2} /></Grid>
                <Grid size={12}><TextField fullWidth label="品牌调性" defaultValue="年轻、时尚、高性价比" size="small" multiline rows={2} /></Grid>
                <Grid size={12}><TextField fullWidth label="核心卖点" defaultValue="成分创新、设计美学、性价比" size="small" multiline rows={2} /></Grid>
              </Grid>
              <Button variant="contained" startIcon={<Save />} sx={{ mt: 2 }}>保存</Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">产品列表</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {['小细跟口红', '动物眼影盘', '粉底液'].map((p) => (
                <Box key={p} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography fontWeight={600}>{p}</Typography>
                    <Typography variant="caption" color="text.secondary">最后分析: 2026-05-20</Typography>
                  </Box>
                  <Chip label="3个任务" size="small" variant="outlined" />
                </Box>
              ))}
              <Button startIcon={<Add />} sx={{ mt: 1 }}>添加产品</Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">竞品信息</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {['花西子', 'MAC', 'Colorkey'].map((c) => (
                <Box key={c} display="flex" alignItems="center" gap={1} mb={1}>
                  <Chip label={c} variant="outlined" onDelete={() => {}} />
                </Box>
              ))}
              <Button startIcon={<Add />} size="small">添加竞品</Button>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>分析概览</Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">总分析任务</Typography>
                <Typography fontWeight={600}>5</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">策略卡</Typography>
                <Typography fontWeight={600}>12</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">报告</Typography>
                <Typography fontWeight={600}>8</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
