import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { watchMessages } from '../../lib/firestore/messages'
import { PAGE_SIZE, hasMorePages, nextPageLimit } from '../../lib/pagination'
import type { Message, MessageStatus } from '../../types/message'

export function useMessages(
  connectionId: string | undefined,
  statusFilter: MessageStatus | 'todas',
) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE)

  // Volta para a primeira página ao trocar de conexão ou de filtro.
  useEffect(() => {
    setPageLimit(PAGE_SIZE)
  }, [connectionId, statusFilter])

  useEffect(() => {
    if (!connectionId || !user) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchMessages(
      user.uid,
      connectionId,
      statusFilter,
      pageLimit,
      (next) => {
        setMessages(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user, connectionId, statusFilter, pageLimit])

  return {
    messages,
    loading,
    error,
    hasMore: hasMorePages(messages.length, pageLimit),
    loadMore: () => setPageLimit(nextPageLimit),
  }
}
