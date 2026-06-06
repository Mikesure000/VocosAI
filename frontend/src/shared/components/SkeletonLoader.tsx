import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export function PageSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={200} height={48} sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 1, borderRadius: 1 }} />
        </CardContent>
      </Card>
    </Box>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} display="flex" gap={2} py={1.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Box flex={1}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Skeleton variant="text" width={60} />
        </Box>
      ))}
    </Box>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 1, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
