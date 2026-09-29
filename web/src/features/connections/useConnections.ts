import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { watchConnections } from '../../lib/firestore/connections'
import { PAGE_SIZE, hasMorePages, nextPageLimit } from '../../lib/pagination'
import type { Connection } from '../../types/connection'

export function useConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!user) {
      setConnections([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchConnections(
      user.uid,
      pageLimit,
      (next) => {
        setConnections(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user, pageLimit])

  return {
    connections,
    loading,
    error,
    hasMore: hasMorePages(connections.length, pageLimit),
    loadMore: () => setPageLimit(nextPageLimit),
  }
}
