import { ArrowBack } from '@mui/icons-material'
import { CircularProgress, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { BroadcastTab } from '../broadcast/BroadcastTab'
import { ContactsTab } from '../contacts/ContactsTab'
import { useConnections } from './useConnections'

type DetailTab = 'contatos' | 'broadcast'

export function ConnectionDetailPage() {
  const { connectionId } = useParams<{ connectionId: string }>()
  const { connections, loading } = useConnections()
  const [tab, setTab] = useState<DetailTab>('contatos')

  if (loading) {
    return <CircularProgress />
  }

  const connection = connections.find((c) => c.id === connectionId)

  if (!connection) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{
        alignItems: "center"
      }}>
        <IconButton component={Link} to="/" aria-label="Voltar">
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{
          fontWeight: 600
        }}>
          {connection.name}
        </Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, value: DetailTab) => setTab(value)}>
        <Tab label="Contatos" value="contatos" />
        <Tab label="Broadcast" value="broadcast" />
      </Tabs>

      {tab === 'contatos' ? (
        <ContactsTab connectionId={connection.id} />
      ) : (
        <BroadcastTab connectionId={connection.id} />
      )}
    </Stack>
  );
}
