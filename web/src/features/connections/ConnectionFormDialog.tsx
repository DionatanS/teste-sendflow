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
    // Fecha sem esperar o servidor: onSnapshot já reflete a escrita otimista.
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
