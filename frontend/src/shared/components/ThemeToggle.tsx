import { IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeStore } from '../stores/themeStore';

export function ThemeToggle() {
  const { mode, toggle } = useThemeStore();
  return (
    <Tooltip title={mode === 'dark' ? '切换亮色模式' : '切换暗色模式'}>
      <IconButton onClick={toggle} size="small">
        {mode === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}
