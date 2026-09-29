import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { watchContacts } from '../../lib/firestore/contacts'
import { PAGE_SIZE, hasMorePages, nextPageLimit } from '../../lib/pagination'
import type { Contact } from '../../types/contact'

export function useContacts(connectionId: string | undefined) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE)

  // Volta para a primeira página ao trocar de conexão (evita herdar o
  // "carregar mais" acumulado da conexão visitada anteriormente).
  useEffect(() => {
    setPageLimit(PAGE_SIZE)
  }, [connectionId])

  useEffect(() => {
    if (!connectionId || !user) {
      setContacts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchContacts(
      user.uid,
      connectionId,
      pageLimit,
      (next) => {
        setContacts(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user, connectionId, pageLimit])

  return {
    contacts,
    loading,
    error,
    hasMore: hasMorePages(contacts.length, pageLimit),
    loadMore: () => setPageLimit(nextPageLimit),
  }
}
