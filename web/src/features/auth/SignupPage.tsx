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

export function SignupPage() {
  const { signUp } = useAuth()
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
      await signUp(email, password)
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
              Criar conta no SendFlow
            </Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Sua conta representa seu cliente na plataforma.
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
            helperText="Mínimo de 6 caracteres"
          />

          <Button type="submit" variant="contained" size="large" loading={submitting}>
            Cadastrar
          </Button>

          <Typography variant="body2" sx={{
            textAlign: "center"
          }}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
