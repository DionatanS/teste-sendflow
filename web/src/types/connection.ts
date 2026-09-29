import type { Timestamp } from 'firebase/firestore'

export type Connection = {
  id: string
  clientId: string
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type NewConnection = {
  name: string
}
