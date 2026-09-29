import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LoadMoreButton } from '../../components/LoadMoreButton'
import { useAuth } from '../auth/authContext'
import {
  createContact,
  deleteContact,
  updateContact,
} from '../../lib/firestore/contacts'
import type { Contact, NewContact } from '../../types/contact'
import { ContactFormDialog } from './ContactFormDialog'
import { useContacts } from './useContacts'

export function ContactsTab({ connectionId }: { connectionId: string }) {
  const { user } = useAuth()
  const { contacts, loading, error, hasMore, loadMore } = useContacts(connectionId)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditing(contact)
    setFormOpen(true)
  }

  async function handleSubmit(input: NewContact) {
    if (!user) return
    if (editing) {
      await updateContact(editing.id, input)
    } else {
      await createContact(user.uid, connectionId, input)
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteContact(pendingDelete.id).catch((err) => {
      console.error('Falha ao excluir contato', err)
    })
    setPendingDelete(null)
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
          Contatos que podem receber broadcasts desta conexão.
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Novo contato
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : contacts.length === 0 ? (
        <Alert severity="info">Nenhum contato ainda. Adicione o primeiro.</Alert>
      ) : (
        <List
          className="rounded-lg"
          sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          {contacts.map((contact) => (
            <ListItem
              key={contact.id}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    edge="end"
                    aria-label="Editar"
                    onClick={() => openEdit(contact)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="Excluir"
                    onClick={() => setPendingDelete(contact)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText primary={contact.name} secondary={contact.phone} />
            </ListItem>
          ))}
        </List>
      )}

      <LoadMoreButton hasMore={hasMore} onClick={loadMore} />

      <ContactFormDialog
        open={formOpen}
        contact={editing}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir contato"
        description={`Excluir "${pendingDelete?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
