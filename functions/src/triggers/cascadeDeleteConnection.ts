import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { deleteConnectionChildren } from '../data/connectionCascade'

/** Única responsável por limpar contacts/messages órfãos ao excluir uma connection. */
export const cascadeDeleteConnection = onDocumentDeleted(
  'connections/{connectionId}',
  async (event) => {
    const deleted = event.data?.data()
    if (!deleted) return

    await deleteConnectionChildren(event.params.connectionId, deleted.clientId)
  },
)
