import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import type { Contact } from '../../types/contact'
import type { Message, NewMessageInput } from '../../types/message'
import { validateScheduledDate } from './scheduleValidation'

type SendMode = 'now' | 'schedule'

type MessageFormDialogProps = {
  open: boolean
  contacts: Contact[]
  message: Message | null
  onSubmit: (input: NewMessageInput) => Promise<void>
  onClose: () => void
}

function toLocalDateTimeInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MessageFormDialog({
  open,
  contacts,
  message,
  onSubmit,
  onClose,
}: MessageFormDialogProps) {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [text, setText] = useState('')
  const [mode, setMode] = useState<SendMode>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isEditingSent = message !== null && message.status === 'enviada'
  const isEditingScheduled = message !== null && message.status === 'agendada'

  useEffect(() => {
    if (!open) return
    setError(null)
    if (message) {
      setSelectedContactIds(message.contactIds)
      setText(message.text)
      setMode(message.status === 'agendada' ? 'schedule' : 'now')
      setScheduledAt(
        message.scheduledFor
          ? toLocalDateTimeInputValue(message.scheduledFor.toDate())
          : '',
      )
    } else {
      setSelectedContactIds([])
      setText('')
      setMode('now')
      const inFiveMinutes = new Date(Date.now() + 5 * 60_000)
      setScheduledAt(toLocalDateTimeInputValue(inFiveMinutes))
    }
  }, [open, message])

  function toggleContact(contactId: string) {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (selectedContactIds.length === 0) {
      setError('Selecione ao menos um contato.')
      return
    }
    if (!text.trim()) {
      setError('Escreva o texto da mensagem.')
      return
    }

    let scheduledFor: Date | null = null
    if (mode === 'schedule' || isEditingScheduled) {
      const result = validateScheduledDate(scheduledAt)
      if (!result.ok) {
        setError(result.error)
        return
      }
      scheduledFor = result.scheduledFor
    }

    onSubmit({ contactIds: selectedContactIds, text: text.trim(), scheduledFor }).catch(
      (err) => {
        console.error('Falha ao salvar mensagem', err)
      },
    )
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {message ? 'Editar mensagem' : 'Nova mensagem'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="pt-1">
            {isEditingSent && (
              <Alert severity="info">
                Esta mensagem já foi enviada e não pode mais ser editada.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Contatos
              </Typography>
              {contacts.length === 0 ? (
                <Alert severity="warning">
                  Esta conexão ainda não tem contatos cadastrados.
                </Alert>
              ) : (
                <List
                  dense
                  className="max-h-48 overflow-auto rounded"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {contacts.map((contact) => (
                    <ListItem key={contact.id} disablePadding>
                      <FormControlLabel
                        className="w-full px-2"
                        control={
                          <Checkbox
                            checked={selectedContactIds.includes(contact.id)}
                            onChange={() => toggleContact(contact.id)}
                            disabled={isEditingSent}
                          />
                        }
                        label={`${contact.name} — ${contact.phone}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </div>

            <TextField
              label="Mensagem"
              value={text}
              onChange={(e) => setText(e.target.value)}
              multiline
              minRows={3}
              required
              disabled={isEditingSent}
            />

            {!isEditingScheduled && !isEditingSent && (
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value as SendMode)}
              >
                <FormControlLabel value="now" control={<Radio />} label="Enviar agora" />
                <FormControlLabel value="schedule" control={<Radio />} label="Agendar" />
              </RadioGroup>
            )}

            {(mode === 'schedule' || isEditingScheduled) && (
              <TextField
                label="Data e hora do envio"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={isEditingSent}
                required
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          {!isEditingSent && (
            <Button type="submit" variant="contained">
              {isEditingScheduled ? 'Salvar' : mode === 'now' ? 'Enviar agora' : 'Agendar'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}
