import { AppBar, Toolbar, IconButton, Typography, Box, useTheme } from '@mui/material';
import {
  Menu as MenuIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon,
  Logout as LogoutIcon, Settings as SettingsIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../shared/stores/themeStore';
import { useAuthStore } from '../../shared/stores/authStore';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../../features/search/GlobalSearch';

interface TopbarProps { onMenuClick: () => void; isMobile: boolean; }

export default function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const theme = useTheme();
  const { mode, toggle } = useThemeStore();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ backgroundColor: theme.palette.background.paper, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {isMobile && <IconButton edge="start" onClick={onMenuClick}><MenuIcon /></IconButton>}
        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ cursor: 'pointer', mr: 2 }}
          onClick={() => navigate('/workspace')}>VocosAI</Typography>
        <GlobalSearch />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/settings')} size="small" title="设置">
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={toggle} size="small">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          {user && <Typography variant="body2" color="text.secondary">{user.name}</Typography>}
          <IconButton onClick={() => { logout(); navigate('/login'); }} size="small" color="error">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
