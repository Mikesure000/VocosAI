import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableRow,
  TableHead, Chip, CircularProgress, TablePagination, FormControl, Select, MenuItem, Button,
} from '@mui/material';
import { ArrowBack, FilterList } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

const actionLabels: Record<string, string> = {
  login: '登录', logout: '登出', create_task: '创建任务', start_task: '启动任务',
  export_report: '导出报告', share_report: '分享报告', delete_task: '删除任务',
};

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/admin/audit-logs', { params: { limit: pageSize, offset: page * pageSize, action: actionFilter || undefined } })
      .then((r) => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  }, [page, pageSize, actionFilter]);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')}>返回</Button>
        <Typography variant="h4" fontWeight={700}>操作日志</Typography>
        <Box flex={1} />
        <Box display="flex" gap={1} alignItems="center">
          <FilterList fontSize="small" />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(0); }} displayEmpty>
              <MenuItem value="">全部操作</MenuItem>
              {Object.entries(actionLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card>
        {loading ? <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120 }}>操作</TableCell>
                  <TableCell>资源</TableCell>
                  <TableCell>用户</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip label={actionLabels[log.action] || log.action} size="small"
                        color={log.action === 'login' ? 'info' : log.action.includes('export') ? 'success' : log.action.includes('delete') ? 'error' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.resourceType}/{log.resourceId?.slice(0, 8) || '-'}</Typography>
                    </TableCell>
                    <TableCell>{log.user?.name || '-'}</TableCell>
                    <TableCell>{log.ipAddress || '-'}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize} onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              labelRowsPerPage="每页" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
