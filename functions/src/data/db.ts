import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Não mova getFirestore() para o escopo do módulo (nem memoize num `const
 * db`): chamada aqui fora de um handler, ela trava a etapa de análise do
 * `firebase deploy` por 10s. initializeApp() sozinho é seguro no topo.
 * https://firebase.google.com/docs/functions/tips#avoid_deployment_timeouts_during_initialization
 */
initializeApp()

export function getDb() {
  return getFirestore()
}
