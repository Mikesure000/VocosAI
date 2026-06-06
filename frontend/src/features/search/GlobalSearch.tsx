import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Paper, List, ListItemButton, ListItemText, ListItemIcon,
  Typography, Chip, InputAdornment, IconButton, Popper, ClickAwayListener,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Folder, Assessment, Chat, Close } from '@mui/icons-material';
import { apiClient } from '../../shared/api/client';

interface SearchResult {
  type: 'project' | 'task' | 'comment';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query || query.length < 1) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoading(true);
      apiClient.get('/api/search', { params: { q: query, limit: 15 } })
        .then((r) => setResults(r.data.results || []))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    navigate(item.link);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    project: <Folder fontSize="small" color="primary" />,
    task: <Assessment fontSize="small" color="warning" />,
    comment: <Chat fontSize="small" color="info" />,
  };

  const typeLabels: Record<string, string> = {
    project: '项目', task: '任务', comment: '评论',
  };

  return (
    <Box ref={anchorRef}>
      <TextField
        size="small"
        placeholder="搜索项目、任务、评论..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { if (query) setOpen(true); }}
        sx={{ width: 280 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => { setQuery(''); setResults([]); }}>
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      <Popper open={open && query.length > 0} anchorEl={anchorRef.current} placement="bottom-start" style={{ zIndex: 1300, width: 380 }}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
            ) : results.length === 0 ? (
              <Box py={2} px={2}>
                <Typography variant="body2" color="text.secondary">无搜索结果</Typography>
              </Box>
            ) : (
              <List dense>
                {results.map((item, i) => (
                  <ListItemButton key={`${item.type}-${item.id}-${i}`} onClick={() => handleSelect(item)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>{typeIcons[item.type]}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={typeLabels[item.type]} size="small" variant="outlined" />
                          {item.subtitle && <Typography variant="caption" color="text.disabled">{item.subtitle}</Typography>}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
