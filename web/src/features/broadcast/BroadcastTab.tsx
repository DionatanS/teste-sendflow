import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LoadMoreButton } from '../../components/LoadMoreButton'
import { useAuth } from '../auth/authContext'
import { useContacts } from '../contacts/useContacts'
import {
  createMessage,
  deleteMessage,
  updateScheduledMessage,
} from '../../lib/firestore/messages'
import type { Message, MessageStatus, NewMessageInput } from '../../types/message'
import { MessageFormDialog } from './MessageFormDialog'
import { useMessages } from './useMessages'

const FILTERS: { label: string; value: MessageStatus | 'todas' }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Agendadas', value: 'agendada' },
  { label: 'Enviadas', value: 'enviada' },
]

function formatDate(timestamp: Message['scheduledFor']) {
  if (!timestamp) return null
  return timestamp.toDate().toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

/**
 * Campos com serverTimestamp() chegam null no cliente até o servidor
 * confirmar o valor real — texto de status tolera essa janela em vez de
 * mostrar "em null"/"para null".
 */
function statusCaption(message: Message) {
  if (message.status === 'agendada') {
    const formatted = formatDate(message.scheduledFor)
    return formatted ? `para ${formatted}` : 'agendando…'
  }
  const formatted = formatDate(message.sentAt)
  return formatted ? `em ${formatted}` : 'enviando…'
}

export function BroadcastTab({ connectionId }: { connectionId: string }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState<MessageStatus | 'todas'>('todas')
  const { messages, loading, error, hasMore, loadMore } = useMessages(connectionId, filter)
  const { contacts } = useContacts(connectionId)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Message | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(message: Message) {
    setEditing(message)
    setFormOpen(true)
  }

  async function handleSubmit(input: NewMessageInput) {
    if (!user) return
    if (editing) {
      await updateScheduledMessage(editing.id, input)
    } else {
      await createMessage(user.uid, connectionId, input)
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteMessage(pendingDelete.id).catch((err) => {
      console.error('Falha ao excluir mensagem', err)
    })
    setPendingDelete(null)
  }

  function contactNames(contactIds: string[]) {
    return contactIds
      .map((id) => contacts.find((c) => c.id === id)?.name ?? '(contato removido)')
      .join(', ')
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between"
        }}>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          Envie um broadcast simulado para os contatos desta conexão.
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Nova mensagem
        </Button>
      </Stack>

      <Tabs
        value={filter}
        onChange={(_, value: MessageStatus | 'todas') => setFilter(value)}
      >
        {FILTERS.map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : messages.length === 0 ? (
        <Alert severity="info">Nenhuma mensagem nesse filtro ainda.</Alert>
      ) : (
        <List
          className="rounded-lg"
          sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          {messages.map((message) => (
            <ListItem
              key={message.id}
              divider
              alignItems="flex-start"
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  {message.status === 'agendada' && (
                    <IconButton
                      edge="end"
                      aria-label="Editar"
                      onClick={() => openEdit(message)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="Excluir"
                    onClick={() => setPendingDelete(message)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{
                    alignItems: "center"
                  }}>
                    <Chip
                      size="small"
                      label={message.status === 'agendada' ? 'Agendada' : 'Enviada'}
                      color={message.status === 'agendada' ? 'warning' : 'success'}
                    />
                    <Typography variant="body2" sx={{
                      color: "text.secondary"
                    }}>
                      {statusCaption(message)}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <>
                    <Typography component="span" className="mt-1" sx={{
                      display: "block"
                    }}>
                      {message.text}
                    </Typography>
                    <Typography component="span" variant="caption" sx={{
                      color: "text.secondary"
                    }}>
                      Para: {contactNames(message.contactIds)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <LoadMoreButton hasMore={hasMore} onClick={loadMore} />

      <MessageFormDialog
        open={formOpen}
        contacts={contacts}
        message={editing}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir mensagem"
        description="Excluir esta mensagem? Essa ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
