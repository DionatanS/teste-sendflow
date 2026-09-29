import { DarkMode, LightMode, Logout } from '@mui/icons-material'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { Link, Outlet } from 'react-router'
import { useAuth } from '../features/auth/authContext'
import { useColorMode } from './ColorModeContext'

export function AppLayout() {
  const { user, logOut } = useAuth()
  const { mode, toggle } = useColorMode()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar className="gap-4">
          <Typography
            component={Link}
            to="/"
            variant="h6"
            className="grow no-underline text-inherit"
            sx={{
              fontWeight: 700
            }}
          >
            SendFlow
          </Typography>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            {user?.email}
          </Typography>
          <IconButton
            onClick={toggle}
            title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            aria-label="Alternar tema"
          >
            {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </IconButton>
          <IconButton onClick={() => logOut()} title="Sair" aria-label="Sair">
            <Logout fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </Box>
  );
}
