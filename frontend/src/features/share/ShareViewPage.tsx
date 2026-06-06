import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default function ShareViewPage() {
  const { token } = useParams();
  return (
    <Box p={4}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" mb={2}>分享报告</Typography>
          <Typography color="text.secondary">Token: {token}</Typography>
          <Typography mt={2}>报告内容加载中...</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
