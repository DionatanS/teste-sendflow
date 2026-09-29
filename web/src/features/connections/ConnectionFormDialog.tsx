import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import type { Connection, NewConnection } from '../../types/connection'

type ConnectionFormDialogProps = {
  open: boolean
  connection: Connection | null
  onSubmit: (input: NewConnection) => Promise<void>
  onClose: () => void
}

export function ConnectionFormDialog({
  open,
  connection,
  onSubmit,
  onClose,
}: ConnectionFormDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) {
      setName(connection?.name ?? '')
    }
  }, [open, connection])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    // Não aguarda o round-trip ao servidor: o cache local do Firestore +
    // onSnapshot já refletem a escrita otimisticamente, e a Promise de
    // escrita só resolve após o ack do servidor — aguardá-la travaria o
    // diálogo aberto (com o botão em loading) enquanto offline/lento.
    onSubmit({ name: name.trim() }).catch((err) => {
      console.error('Falha ao salvar conexão', err)
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{connection ? 'Editar conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!name.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
