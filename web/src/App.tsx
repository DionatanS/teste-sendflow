import { CssBaseline, ThemeProvider } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './app/AppLayout'
import { ColorModeProvider, useColorMode } from './app/ColorModeContext'
import { getTheme } from './app/theme'
import { AuthProvider } from './features/auth/authContext'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { SignupPage } from './features/auth/SignupPage'
import { ConnectionDetailPage } from './features/connections/ConnectionDetailPage'
import { ConnectionsPage } from './features/connections/ConnectionsPage'

function ThemedApp() {
  const { mode } = useColorMode()

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<ConnectionsPage />} />
              <Route path="/conexoes/:connectionId" element={<ConnectionDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export function App() {
  return (
    <ColorModeProvider>
      <ThemedApp />
    </ColorModeProvider>
  )
}
