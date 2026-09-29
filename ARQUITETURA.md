# Arquitetura — SendFlow Broadcast

Este documento explica como a aplicação é organizada e por que ela foi construída dessa forma: modelagem de dados, isolamento multi-tenant, o frontend (`/web`) e as Cloud Functions (`/functions`).

## Visão geral

SendFlow Broadcast é uma aplicação de broadcast multi-tenant: cada **cliente** (uma conta autenticada) gerencia suas próprias **conexões** (canais de disparo), cada conexão tem sua própria lista de **contatos**, e o cliente compõe **mensagens** de broadcast para os contatos de uma conexão — enviando imediatamente (simulado) ou agendando para o futuro. Uma mensagem agendada muda sozinha para "enviada" no horário certo, mesmo com o cliente sem o app aberto, através de uma Cloud Function agendada.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| UI | Material UI + Tailwind CSS |
| Backend | Firebase (Authentication, Firestore, Cloud Functions v2) |
| Roteamento | React Router |
| Testes | Vitest (unitários) + `@firebase/rules-unit-testing` (Security Rules) |

## Estrutura de pastas

```
web/src/
  app/                    # Shell da aplicação: rotas, tema, dark mode
  features/
    auth/                 # Login, cadastro, proteção de rotas
    connections/          # CRUD de conexões
    contacts/             # CRUD de contatos
    broadcast/            # Composição, agendamento e listagem de mensagens
  lib/
    firebase.ts           # Inicialização do SDK do Firebase
    firestore/             # Uma função de acesso a dados por coleção
    pagination.ts         # Lógica de paginação ("carregar mais")
  components/             # Componentes compartilhados (diálogo de confirmação, etc.)
  types/                  # Tipos de domínio (Connection, Contact, Message)

functions/src/
  triggers/               # Cloud Functions expostas (entry points finos)
  data/                   # Acesso ao Firestore via Admin SDK
  domain/                 # Funções puras de regra de negócio
```

Nenhuma camada usa classes — componentes React são funções, hooks são funções, e as Cloud Functions são funções exportadas. "Objetos" de domínio são apenas tipos (`type`), nunca `class`.

## Modelagem de dados

O Firestore tem três collections de nível raiz — **sem subcoleções**:

```
connections { id, clientId, name, createdAt, updatedAt }
contacts    { id, clientId, connectionId, name, phone, createdAt, updatedAt }
messages    { id, clientId, connectionId, contactIds[], text, status,
              scheduledFor, sentAt, createdAt, updatedAt }
```

Todo documento carrega o campo `clientId` diretamente — não só `contacts`/`messages` referenciam seu pai via `connectionId`, mas **também** carregam o `clientId` do dono, duplicado. Essa duplicação é proposital: ela é o que permite tanto as queries quanto as Security Rules isolarem dados por cliente sem nunca precisar de uma leitura auxiliar (`get()`) para descobrir "de quem é esse documento".

Não existe uma collection `clients`: o próprio `uid` do Firebase Authentication já é o identificador do tenant.

## Isolamento multi-tenant

As regras em `firestore.rules` seguem o mesmo padrão nas três collections:

```
allow read, delete: if resource.data.clientId == request.auth.uid;
allow create: if request.resource.data.clientId == request.auth.uid;
allow update: if ambos os dois acima, e o clientId não muda;
```

**Detalhe importante, fácil de errar:** para uma *query de coleção* (ex.: "lista todos os contatos desta conexão"), o Firestore só autoriza a operação se a **própria query** já filtra pelos mesmos campos que a regra usa — ele não avalia documento por documento como faz num `get()` de um id específico. Uma query que filtra só por `connectionId`, contra uma regra que verifica `clientId`, é rejeitada inteira com `permission-denied`, mesmo que todos os documentos retornados de fato pertencessem ao dono certo.

Por isso, toda leitura de lista em `web/src/lib/firestore/*.ts` filtra explicitamente por `clientId` **e** pelo campo específico (`connectionId`, `status`, etc.):

```ts
query(
  contactsCollection,
  where('clientId', '==', clientId),
  where('connectionId', '==', connectionId),
  orderBy('createdAt', 'desc'),
)
```

Os índices compostos correspondentes estão em `firestore.indexes.json`.

**Trade-off aceito conscientemente:** as regras não validam, via `get()` extra, que a `connection` referenciada por `connectionId` realmente pertence ao mesmo `clientId` do contato/mensagem — isso custaria uma leitura adicional a cada escrita. A interface nunca produz essa inconsistência (os seletores de conexão só listam as conexões do próprio cliente), e o isolamento de leitura/escrita entre clientes continua garantido em qualquer cenário, já que cada documento é protegido individualmente pelo seu próprio `clientId`.

## Frontend (`/web`)

### Camadas

```
Componente (UI)  →  Hook (useConnections, useContacts, useMessages)  →  lib/firestore/*.ts  →  SDK do Firebase
```

- **Componentes** só renderizam e disparam ações — nunca chamam o SDK do Firestore diretamente.
- **Hooks** (`useConnections`, `useContacts`, `useMessages`) são o único lugar que assina `onSnapshot` (tempo real) e expõem `{ dados, loading, error, hasMore, loadMore }`.
- **`lib/firestore/*.ts`** contém as funções puras de acesso a dados (uma por coleção): construir a query, mapear o snapshot para o tipo de domínio, e as funções de escrita (`create*`, `update*`, `delete*`).

### Tempo real e escrita otimista

Todas as listas usam `onSnapshot`, refletindo mudanças sem reload. As escritas (criar, editar, excluir) **não aguardam** a confirmação do servidor antes de fechar o diálogo — o cache local do Firestore já aplica a mudança otimisticamente e o `onSnapshot` reflete na hora; esperar o round-trip ao servidor deixaria a UI travada com um spinner sempre que a rede estivesse mais lenta. Erros de escrita (ex.: regra de segurança rejeitando) são capturados e logados, sem bloquear a interface.

### Paginação

Cada hook de listagem mantém um `pageLimit` (padrão 10, ver `lib/pagination.ts`) usado como `limit()` na query. O botão "Carregar mais" aumenta esse limite, re-inscrevendo o listener com uma janela maior — mantendo a atualização em tempo real (ao contrário de uma paginação por cursor clássica, que não convive bem com um listener ao vivo).

### Dark mode

`app/colorMode.ts` resolve o tema inicial (preferência salva > preferência do sistema `prefers-color-scheme` > claro) e persiste a escolha do usuário em `localStorage`. `ColorModeContext` expõe `{ mode, toggle }`, consumido pelo botão na barra superior.

### Broadcast

`MessageFormDialog` cobre três casos com o mesmo formulário: criar (enviar agora ou agendar), e editar uma mensagem já agendada (sem opção de "enviar agora" — só existe agendar ou salvar as alterações). Mensagens já `enviada` são somente leitura. A validação de data (`scheduleValidation.ts`) rejeita qualquer horário que não seja estritamente futuro.

## Backend (`/functions`)

Só existem duas Cloud Functions — o resto é CRUD direto do client (protegido pelas Security Rules). Cloud Functions ficam reservadas para o que exige execução confiável no backend, algo que o client não pode garantir sozinho.

### `flipDueMessages` — transição automática de status

```ts
export const flipDueMessages = onSchedule('every 1 minutes', async () => {
  const now = new Date()
  const dueDocs = await findDueScheduledMessages(now)
  if (dueDocs.length === 0) return
  await markMessagesAsSent(dueDocs.map((doc) => doc.id), now)
})
```

Roda a cada minuto e varre **todos os clientes** de uma vez (`where('status', '==', 'agendada').where('scheduledFor', '<=', now)`, sem filtrar por `clientId`) — é uma varredura de backend, não uma operação por usuário. O client nunca escreve `status: 'enviada'` a partir de um agendamento; a própria Security Rule de `messages` bloqueia o client de mudar o campo `status` via update, então essa transição só pode acontecer pelo Admin SDK (que ignora as regras).

### `cascadeDeleteConnection` — limpeza ao excluir uma conexão

```ts
export const cascadeDeleteConnection = onDocumentDeleted(
  'connections/{connectionId}',
  async (event) => {
    const deleted = event.data?.data()
    if (!deleted) return
    await deleteConnectionChildren(event.params.connectionId, deleted.clientId)
  },
)
```

A UI só apaga o documento da conexão. Esse trigger reage à exclusão e apaga em lote (respeitando o limite de 500 operações por batch do Firestore, ver `domain/chunk.ts`) os `contacts` e `messages` daquela conexão — evitando documentos órfãos no banco.

### Inicialização do Admin SDK

```ts
// functions/src/data/db.ts
initializeApp()               // síncrono, sem I/O — seguro no escopo do módulo
export function getDb() {
  return getFirestore()       // chamado fresco a cada invocação, nunca memoizado
}
```

`initializeApp()` roda no carregamento do módulo (é síncrono e não faz chamada de rede). Já `getFirestore()` é chamado sempre dentro de uma função, nunca guardado num `const db` de módulo — construir o client do Firestore eagerly, fora de um handler, trava a etapa de análise estática do `firebase deploy` (o processo local do CLI carrega o código para descobrir o que existe, sem as credenciais/metadata server do ambiente Cloud disponíveis, e a resolução do project id acaba esperando por uma rede que não existe ali).

## Testes

- **`web/src/**/*.test.ts`** (Vitest) — funções puras: máscara de telefone, validação de agendamento, resolução de dark mode, paginação.
- **`functions/test/firestore.rules.test.ts`** (`@firebase/rules-unit-testing`, roda via `npm run test:rules`) — prova programaticamente o isolamento multi-tenant: cliente A não lê/edita/exclui dado de cliente B, criação com `clientId` de outro cliente é rejeitada, e o status de uma mensagem não muda por update direto do client.
