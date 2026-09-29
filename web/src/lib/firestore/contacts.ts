import {
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
import type { Contact, NewContact } from '../../types/contact'

const contactsCollection = collection(db, 'contacts')

export function watchContacts(
  clientId: string,
  connectionId: string,
  pageLimit: number,
  onChange: (contacts: Contact[]) => void,
  onError: (error: Error) => void,
) {
  // clientId também entra na query (não só na regra) porque, para uma
  // consulta de coleção (list), o Firestore só autoriza se a PRÓPRIA query
  // já restringe pelos campos que a regra usa — resource.data.clientId
  // sozinho na regra não é suficiente para provar isso a uma "list" query.
  const q = query(
    contactsCollection,
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
    limit(pageLimit),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const contacts = snapshot.docs.map((d) => (({
        id: d.id,
        ...d.data()
      }) as Contact))
      onChange(contacts)
    },
    onError,
  );
}

export async function createContact(
  clientId: string,
  connectionId: string,
  input: NewContact,
) {
  await addDoc(contactsCollection, {
    clientId,
    connectionId,
    name: input.name,
    phone: input.phone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateContact(contactId: string, input: NewContact) {
  await updateDoc(doc(contactsCollection, contactId), {
    name: input.name,
    phone: input.phone,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteContact(contactId: string) {
  await deleteDoc(doc(contactsCollection, contactId))
}
