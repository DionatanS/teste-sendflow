import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import type { Contact, NewContact } from '../../types/contact'
import { formatPhoneInput } from './phoneMask'

type ContactFormDialogProps = {
  open: boolean
  contact: Contact | null
  onSubmit: (input: NewContact) => Promise<void>
  onClose: () => void
}

export function ContactFormDialog({
  open,
  contact,
  onSubmit,
  onClose,
}: ContactFormDialogProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? '')
      setPhone(contact?.phone ?? '')
    }
  }, [open, contact])

  const isValid = name.trim() !== '' && phone.trim() !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isValid) return
    // Ver ConnectionFormDialog: não aguarda o ack do servidor para fechar.
    onSubmit({ name: name.trim(), phone: phone.trim() }).catch((err) => {
      console.error('Falha ao salvar contato', err)
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{contact ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="pt-1">
            <TextField
              autoFocus
              fullWidth
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="+55 11 91234-5678"
              slotProps={{ htmlInput: { inputMode: 'tel' } }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!isValid}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
