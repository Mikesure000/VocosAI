import { Suspense, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AnimatedPage } from './AnimatedPage';
import { ErrorBoundary } from './ErrorBoundary';
import { PageSkeleton } from './SkeletonLoader';

interface PageShellProps {
  children: ReactNode;
  loading?: boolean;
  skeleton?: boolean;
}

export function PageShell({ children, loading, skeleton }: PageShellProps) {
  if (loading && skeleton) return <AnimatedPage><PageSkeleton /></AnimatedPage>;
  if (loading) return (
    <AnimatedPage>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </AnimatedPage>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <AnimatedPage>{children}</AnimatedPage>
      </Suspense>
    </ErrorBoundary>
  );
}
