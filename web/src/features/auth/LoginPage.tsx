import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from './authContext'
import { describeAuthError } from './authErrors'

export function LoginPage() {
  const { logIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await logIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      className="flex min-h-screen items-center justify-center px-4"
      sx={{ bgcolor: 'background.default' }}
    >
      <Paper component="form" onSubmit={handleSubmit} elevation={2} className="w-full max-w-sm p-8">
        <Stack spacing={3}>
          <div>
            <Typography variant="h5" sx={{
              fontWeight: 600
            }}>
              Entrar no SendFlow
            </Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Acesse sua conta para gerenciar conexões e broadcasts.
            </Typography>
          </div>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" loading={submitting}>
            Entrar
          </Button>

          <Typography variant="body2" sx={{
            textAlign: "center"
          }}>
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
