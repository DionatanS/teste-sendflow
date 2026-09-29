import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Message, MessageStatus, NewMessageInput } from '../../types/message'

const messagesCollection = collection(db, 'messages')

export function watchMessages(
  clientId: string,
  connectionId: string,
  statusFilter: MessageStatus | 'todas',
  pageLimit: number,
  onChange: (messages: Message[]) => void,
  onError: (error: Error) => void,
) {
  // clientId também entra na query, não só na regra — ver watchContacts.
  const constraints = [
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
  ]
  if (statusFilter !== 'todas') {
    constraints.push(where('status', '==', statusFilter))
  }

  const q = query(
    messagesCollection,
    ...constraints,
    orderBy('createdAt', 'desc'),
    limit(pageLimit),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => (({
        id: d.id,
        ...d.data()
      }) as Message))
      onChange(messages)
    },
    onError,
  );
}

export async function createMessage(
  clientId: string,
  connectionId: string,
  input: NewMessageInput,
) {
  const isScheduled = input.scheduledFor !== null

  await addDoc(messagesCollection, {
    clientId,
    connectionId,
    contactIds: input.contactIds,
    text: input.text,
    status: isScheduled ? 'agendada' : 'enviada',
    scheduledFor: isScheduled ? Timestamp.fromDate(input.scheduledFor as Date) : null,
    sentAt: isScheduled ? null : serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateScheduledMessage(
  messageId: string,
  input: NewMessageInput,
) {
  await updateDoc(doc(messagesCollection, messageId), {
    contactIds: input.contactIds,
    text: input.text,
    scheduledFor: input.scheduledFor ? Timestamp.fromDate(input.scheduledFor) : null,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMessage(messageId: string) {
  await deleteDoc(doc(messagesCollection, messageId))
}
