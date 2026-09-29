import { Timestamp } from 'firebase-admin/firestore'
import { chunk } from '../domain/chunk'
import { getDb } from './db'

const BATCH_LIMIT = 500

/** Mensagens agendadas cujo horário já passou, de todos os clientes (varredura global do backend). */
export async function findDueScheduledMessages(now: Date) {
  const snapshot = await getDb()
    .collection('messages')
    .where('status', '==', 'agendada')
    .where('scheduledFor', '<=', Timestamp.fromDate(now))
    .get()

  return snapshot.docs
}

export async function markMessagesAsSent(messageIds: string[], sentAt: Date) {
  const db = getDb()
  const sentAtTimestamp = Timestamp.fromDate(sentAt)

  for (const batchIds of chunk(messageIds, BATCH_LIMIT)) {
    const batch = db.batch()
    for (const id of batchIds) {
      batch.update(db.collection('messages').doc(id), {
        status: 'enviada',
        sentAt: sentAtTimestamp,
        updatedAt: sentAtTimestamp,
      })
    }
    await batch.commit()
  }
}
