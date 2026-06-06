import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatCard({ label, value, icon, color = '#4caf50', subtitle, size = 'medium' }: StatCardProps) {
  const py = size === 'small' ? 1 : size === 'large' ? 2.5 : 1.5;
  const valueSize = size === 'small' ? 'h6' : size === 'large' ? 'h3' : 'h5';
  return (
    <Card sx={{ borderTop: `3px solid ${color}`, height: '100%' }}>
      <CardContent sx={{ py, textAlign: 'center', '&:last-child': { pb: py } }}>
        {icon && <Box mb={0.5}>{icon}</Box>}
        <Typography variant={valueSize as any} fontWeight={700}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {subtitle && <Typography variant="caption" display="block" color="text.disabled" mt={0.5}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

interface StatRow {
  label: string; value: string | number; color?: string;
}

export function StatGrid({ items, cols = 6 }: { items: StatRow[]; cols?: number }) {
  const size = 12 / cols;
  return (
    <Box display="grid" gridTemplateColumns={`repeat(auto-fit, minmax(${120}px, 1fr))`} gap={2}>
      {items.map((item, i) => (
        <StatCard key={i} label={item.label} value={item.value} color={item.color} size="small" />
      ))}
    </Box>
  );
}
