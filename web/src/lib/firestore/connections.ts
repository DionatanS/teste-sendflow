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
import type { Connection, NewConnection } from '../../types/connection'

const connectionsCollection = collection(db, 'connections')

export function watchConnections(
  clientId: string,
  pageLimit: number,
  onChange: (connections: Connection[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(
    connectionsCollection,
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(pageLimit),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const connections = snapshot.docs.map(
        (d) => (({
          id: d.id,
          ...d.data()
        }) as Connection),
      )
      onChange(connections)
    },
    onError,
  );
}

export async function createConnection(clientId: string, input: NewConnection) {
  await addDoc(connectionsCollection, {
    clientId,
    name: input.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateConnection(connectionId: string, input: NewConnection) {
  await updateDoc(doc(connectionsCollection, connectionId), {
    name: input.name,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteConnection(connectionId: string) {
  await deleteDoc(doc(connectionsCollection, connectionId))
}
