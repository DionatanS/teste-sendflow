import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/**
 * Testa firestore.rules contra o emulador (exige `firebase emulators:exec`,
 * roda como `npm run test:rules` — ver README para a limitação de ambiente
 * conhecida ao rodar o emulador do Firestore localmente nesta máquina).
 *
 * Cobre AD-1 (isolamento multi-tenant por clientId) e AD-3 (status de
 * mensagem só muda por create, nunca por update do client).
 */

const CLIENT_A = 'client-a-uid'
const CLIENT_B = 'client-b-uid'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-sendflow-rules-test',
    firestore: {
      rules: readFileSync('../firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('connections', () => {
  it('nega leitura/escrita para usuário não autenticado', async () => {
    const unauthed = testEnv.unauthenticatedContext()
    await assertFails(
      unauthed.firestore().collection('connections').add({ clientId: CLIENT_A, name: 'x' }),
    )
  })

  it('permite ao dono criar uma connection com o próprio clientId', async () => {
    const asA = testEnv.authenticatedContext(CLIENT_A)
    await assertSucceeds(
      asA.firestore().collection('connections').add({ clientId: CLIENT_A, name: 'Vendas' }),
    )
  })

  it('nega criar uma connection com clientId de outro usuário', async () => {
    const asA = testEnv.authenticatedContext(CLIENT_A)
    await assertFails(
      asA.firestore().collection('connections').add({ clientId: CLIENT_B, name: 'Vendas' }),
    )
  })

  it('nega a um cliente ler/editar/excluir a connection de outro cliente', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const asB = testEnv.authenticatedContext(CLIENT_B)
    const doc = asB.firestore().collection('connections').doc(connectionId)

    await assertFails(doc.get({ source: 'server' }))
    await assertFails(doc.update({ name: 'Hackeado' }))
    await assertFails(doc.delete())
  })

  it('permite ao dono ler/editar/excluir sua própria connection', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    const doc = asA.firestore().collection('connections').doc(connectionId)

    await assertSucceeds(doc.get({ source: 'server' }))
    await assertSucceeds(doc.update({ name: 'Vendas Renomeada' }))
    await assertSucceeds(doc.delete())
  })

  it('nega mudar o clientId de uma connection via update', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    await assertFails(
      asA.firestore().collection('connections').doc(connectionId).update({ clientId: CLIENT_B }),
    )
  })
})

describe('contacts', () => {
  it('nega a um cliente ler os contatos de outro cliente', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const contactId = await seedContact(CLIENT_A, connectionId, 'Maria')
    const asB = testEnv.authenticatedContext(CLIENT_B)

    await assertFails(
      asB.firestore().collection('contacts').doc(contactId).get({ source: 'server' }),
    )
  })

  it('permite ao dono ler/editar/excluir seu próprio contato', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const contactId = await seedContact(CLIENT_A, connectionId, 'Maria')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    const doc = asA.firestore().collection('contacts').doc(contactId)

    await assertSucceeds(doc.get({ source: 'server' }))
    await assertSucceeds(doc.update({ name: 'Maria Silva' }))
    await assertSucceeds(doc.delete())
  })

  it('nega mudar o clientId ou a connectionId de um contato via update', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const contactId = await seedContact(CLIENT_A, connectionId, 'Maria')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    const doc = asA.firestore().collection('contacts').doc(contactId)

    await assertFails(doc.update({ clientId: CLIENT_B }))
    await assertFails(doc.update({ connectionId: 'outra-connection' }))
  })
})

describe('messages', () => {
  it('nega criar mensagem com status fora de agendada/enviada', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    await assertFails(
      asA
        .firestore()
        .collection('messages')
        .add({
          clientId: CLIENT_A,
          connectionId,
          contactIds: [],
          text: 'oi',
          status: 'rascunho',
          scheduledFor: null,
          sentAt: null,
        }),
    )
  })

  it('permite criar mensagem enviada ou agendada pelo dono', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const asA = testEnv.authenticatedContext(CLIENT_A)
    await assertSucceeds(
      asA
        .firestore()
        .collection('messages')
        .add({
          clientId: CLIENT_A,
          connectionId,
          contactIds: [],
          text: 'oi',
          status: 'enviada',
          scheduledFor: null,
          sentAt: null,
        }),
    )
  })

  it('nega ao client mudar o status de uma mensagem via update (AD-3)', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const messageId = await seedMessage(CLIENT_A, connectionId, 'agendada')
    const asA = testEnv.authenticatedContext(CLIENT_A)

    await assertFails(
      asA.firestore().collection('messages').doc(messageId).update({ status: 'enviada' }),
    )
  })

  it('permite ao dono editar o texto de uma mensagem agendada sem mudar o status', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const messageId = await seedMessage(CLIENT_A, connectionId, 'agendada')
    const asA = testEnv.authenticatedContext(CLIENT_A)

    await assertSucceeds(
      asA.firestore().collection('messages').doc(messageId).update({ text: 'texto editado' }),
    )
  })

  it('nega a um cliente ler as mensagens de outro cliente', async () => {
    const connectionId = await seedConnection(CLIENT_A, 'Vendas')
    const messageId = await seedMessage(CLIENT_A, connectionId, 'enviada')
    const asB = testEnv.authenticatedContext(CLIENT_B)

    await assertFails(
      asB.firestore().collection('messages').doc(messageId).get({ source: 'server' }),
    )
  })
})

async function seedConnection(clientId: string, name: string) {
  return testEnv.withSecurityRulesDisabled(async (context) => {
    const ref = await context.firestore().collection('connections').add({ clientId, name })
    return ref.id
  })
}

async function seedContact(clientId: string, connectionId: string, name: string) {
  return testEnv.withSecurityRulesDisabled(async (context) => {
    const ref = await context
      .firestore()
      .collection('contacts')
      .add({ clientId, connectionId, name, phone: '+55 11 90000-0000' })
    return ref.id
  })
}

async function seedMessage(
  clientId: string,
  connectionId: string,
  status: 'agendada' | 'enviada',
) {
  return testEnv.withSecurityRulesDisabled(async (context) => {
    const ref = await context
      .firestore()
      .collection('messages')
      .add({
        clientId,
        connectionId,
        contactIds: [],
        text: 'oi',
        status,
        scheduledFor: null,
        sentAt: null,
      })
    return ref.id
  })
}
