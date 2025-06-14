import { AppBar, Toolbar, Typography } from '@mui/material';
import ThemeToggleButton from './ThemeButton';

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Tic Tac Toe - G1
        </Typography>
        <ThemeToggleButton />
      </Toolbar>
    </AppBar>
  );
}
