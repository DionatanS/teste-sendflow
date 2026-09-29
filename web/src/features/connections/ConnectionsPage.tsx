import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LoadMoreButton } from '../../components/LoadMoreButton'
import { useAuth } from '../auth/authContext'
import {
  createConnection,
  deleteConnection,
  updateConnection,
} from '../../lib/firestore/connections'
import type { Connection, NewConnection } from '../../types/connection'
import { ConnectionFormDialog } from './ConnectionFormDialog'
import { useConnections } from './useConnections'

export function ConnectionsPage() {
  const { user } = useAuth()
  const { connections, loading, error, hasMore, loadMore } = useConnections()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Connection | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Connection | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(connection: Connection) {
    setEditing(connection)
    setFormOpen(true)
  }

  async function handleSubmit(input: NewConnection) {
    if (!user) return
    if (editing) {
      await updateConnection(editing.id, input)
    } else {
      await createConnection(user.uid, input)
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteConnection(pendingDelete.id).catch((err) => {
      console.error('Falha ao excluir conexão', err)
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
        <div>
          <Typography variant="h5" sx={{
            fontWeight: 600
          }}>
            Conexões
          </Typography>
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            Seus canais de disparo. Cada conexão tem sua própria lista de contatos.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Nova conexão
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : connections.length === 0 ? (
        <Alert severity="info">
          Você ainda não tem conexões. Crie a primeira para começar a adicionar contatos.
        </Alert>
      ) : (
        <List
          className="rounded-lg"
          sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          {connections.map((connection) => (
            <ListItem
              key={connection.id}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    edge="end"
                    aria-label="Editar"
                    onClick={() => openEdit(connection)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="Excluir"
                    onClick={() => setPendingDelete(connection)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              }
              disablePadding
            >
              <ListItemButton component={Link} to={`/conexoes/${connection.id}`}>
                <ListItemText primary={connection.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <LoadMoreButton hasMore={hasMore} onClick={loadMore} />

      <ConnectionFormDialog
        open={formOpen}
        connection={editing}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir conexão"
        description={`Excluir "${pendingDelete?.name}"? Todos os contatos e mensagens dessa conexão também serão removidos.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
