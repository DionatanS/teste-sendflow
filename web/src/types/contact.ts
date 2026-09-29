import type { Timestamp } from 'firebase/firestore'

export type Contact = {
  id: string
  clientId: string
  connectionId: string
  name: string
  phone: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type NewContact = {
  name: string
  phone: string
}
