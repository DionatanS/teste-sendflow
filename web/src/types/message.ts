import type { Timestamp } from 'firebase/firestore'

export type MessageStatus = 'agendada' | 'enviada'

export type Message = {
  id: string
  clientId: string
  connectionId: string
  contactIds: string[]
  text: string
  status: MessageStatus
  scheduledFor: Timestamp | null
  sentAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type NewMessageInput = {
  contactIds: string[]
  text: string
  /** null => enviar imediatamente; presente => agendar */
  scheduledFor: Date | null
}
