import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * initializeApp() é síncrono e não faz I/O — seguro no escopo do módulo.
 * getFirestore() fica de fora daqui (chamado fresco a cada invocação via
 * getDb(), nunca memoizado num `const db` de módulo): foi essa construção
 * antecipada do client do Firestore, não o initializeApp() em si, que
 * travava a etapa de análise estática do `firebase deploy` — ela tenta
 * resolver o project id via metadata server, indisponível no processo
 * local do CLI que carrega o código pra descobrir o que existe pra deploy.
 * https://firebase.google.com/docs/functions/tips#avoid_deployment_timeouts_during_initialization
 */
initializeApp()

export function getDb() {
  return getFirestore()
}
