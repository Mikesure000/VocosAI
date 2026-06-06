import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';

const exportTypes = [
  { label: 'Markdown', type: 'markdown', desc: '纯文本格式，方便编辑' },
  { label: 'PDF', type: 'pdf', desc: '正式报告格式' },
  { label: 'Word', type: 'word', desc: '可二次编辑' },
  { label: 'Excel', type: 'excel', desc: '数据表格导出' },
  { label: 'HTML 分享', type: 'html', desc: '在线分享链接' },
  { label: 'PPT', type: 'ppt', desc: '演示文稿' },
];

export default function ExportCenterPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>导出中心</Typography>
      <Grid container spacing={3}>
        {exportTypes.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.type}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                <Button startIcon={<FileDownload />} sx={{ mt: 1 }} variant="outlined" size="small">
                  导出
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
