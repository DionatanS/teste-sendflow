import { onSchedule } from 'firebase-functions/v2/scheduler'
import { findDueScheduledMessages, markMessagesAsSent } from '../data/messages'

/**
 * AD-3: única gravadora de `status: 'enviada'` por agendamento.
 * Roda a cada minuto e varre TODOS os clientes (varredura global de backend,
 * não filtrada por clientId) — a leitura pela UI de cada cliente continua
 * isolada por `clientId` nas queries/regras do lado do client.
 */
export const flipDueMessages = onSchedule('every 1 minutes', async () => {
  const now = new Date()
  const dueDocs = await findDueScheduledMessages(now)

  if (dueDocs.length === 0) {
    return
  }

  await markMessagesAsSent(
    dueDocs.map((doc) => doc.id),
    now,
  )
})
