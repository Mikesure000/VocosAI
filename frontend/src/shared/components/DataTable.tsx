import {
  Table, TableBody, TableCell, TableRow, TableHead, TablePagination,
  Chip, Typography, Box, IconButton, LinearProgress,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import type { ReactNode } from 'react';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  size?: 'small' | 'medium';
}

export function DataTable<T extends Record<string, any>>({
  columns, rows, total = 0, page = 0, pageSize = 20,
  loading, onPageChange, onPageSizeChange, onRowClick,
  emptyText = '暂无数据', size = 'small',
}: DataTableProps<T>) {
  return (
    <>
      {loading && <LinearProgress sx={{ mb: 0 }} />}
      <Table size={size}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ width: col.width }} align={col.align || 'left'}>
                <Typography variant="caption" fontWeight={600}>{col.label}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="text.secondary" py={4}>{emptyText}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={row.id || i} hover={!!onRowClick} sx={{ cursor: onRowClick ? 'pointer' : undefined }}
                onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || 'left'}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {total > 0 && onPageChange && (
        <TablePagination
          component="div" count={total} page={page} onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={pageSize} onRowsPerPageChange={(e) => { onPageSizeChange?.(Number(e.target.value)); }}
          labelRowsPerPage="每页" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      )}
    </>
  );
}

// Pre-built renderers
export function StarScore({ score, size = 14 }: { score: number; size?: number }) {
  return (
    <Box display="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        i < score ? <Star key={i} sx={{ fontSize: size, color: '#ff9800' }} /> : <StarBorder key={i} sx={{ fontSize: size, color: '#ccc' }} />
      ))}
    </Box>
  );
}

export function StatusChip({ status, map }: { status: string; map?: Record<string, { label: string; color: any }> }) {
  const def = map?.[status] || { label: status, color: 'default' };
  return <Chip label={def.label} size="small" color={def.color as any} />;
}

export function TruncatedText({ text, max = 60 }: { text: string; max?: number }) {
  return (
    <Typography variant="body2" noWrap sx={{ maxWidth: max * 7 }}>
      {text}
    </Typography>
  );
}
