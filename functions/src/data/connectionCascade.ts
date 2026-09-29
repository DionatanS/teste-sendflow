import { chunk } from '../domain/chunk'
import { getDb } from './db'

const BATCH_LIMIT = 500

/** Apaga em lote todos os documentos de `collectionName` com o `connectionId` e `clientId` dados. */
async function deleteWhereConnection(
  collectionName: 'contacts' | 'messages',
  connectionId: string,
  clientId: string,
) {
  const db = getDb()
  const snapshot = await db
    .collection(collectionName)
    .where('connectionId', '==', connectionId)
    .where('clientId', '==', clientId)
    .get()

  for (const batchDocs of chunk(snapshot.docs, BATCH_LIMIT)) {
    const batch = db.batch()
    for (const doc of batchDocs) {
      batch.delete(doc.ref)
    }
    await batch.commit()
  }
}

export async function deleteConnectionChildren(connectionId: string, clientId: string) {
  await deleteWhereConnection('contacts', connectionId, clientId)
  await deleteWhereConnection('messages', connectionId, clientId)
}
