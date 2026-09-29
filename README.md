# SendFlow Broadcast

Teste técnico para a vaga de Desenvolvedor(a) Full Stack na SendFlow — aplicação de broadcast multi-tenant construída com **React + TypeScript + Vite** (`/web`) e **Firebase** (Authentication, Firestore, Cloud Functions) (`/functions`).

**Aplicação publicada:** https://sendflow-26d05.web.app — Hosting, Firestore (rules + indexes) e as duas Cloud Functions (`flipDueMessages`, `cascadeDeleteConnection`) estão no ar num projeto Firebase real (plano Blaze), e o fluxo completo foi validado de ponta a ponta nesse ambiente, incluindo a transição automática de status.

O enunciado completo está em [`docs/enunciado-teste.md`](docs/enunciado-teste.md).

## Estrutura

```
web/         # Frontend (Vite + React + TS + MUI + Tailwind)
functions/   # Firebase Cloud Functions (TypeScript)
firestore.rules, firestore.indexes.json, firebase.json   # Config do Firebase na raiz
docs/        # Enunciado do teste
```

## Pré-requisitos

- Node.js 22+
- Uma conta Firebase e o Firebase CLI (`npm i -g firebase-tools`, ou use via `npx firebase-tools`)
- Para rodar os emuladores locais do Firestore: **Java 21+** (o emulador de Auth não precisa de Java)

## Setup local

```bash
# 1. Instalar dependências
cd web && npm install
cd ../functions && npm install

# 2. Configurar variáveis de ambiente do frontend
cd ../web
cp .env.example .env
# preencha com as credenciais do seu projeto Firebase (Console > Configurações do projeto > Apps)
```

## Rodando localmente

### Opção A — contra um projeto Firebase real (recomendado para validar tudo, inclusive as Cloud Functions agendadas)

```bash
firebase login
firebase use --add   # selecione/crie seu projeto e dê um alias (ex: default)
cd functions && npm run build
cd .. && firebase deploy
```

Isso publica o frontend no Firebase Hosting, as regras do Firestore e as duas Cloud Functions. Depois disso, edite `web/.env` com as credenciais desse projeto (ou apenas acesse a URL do Hosting, já que lá o app já está configurado).

### Opção B — Firebase Emulator Suite (sem custo, sem deploy)

```bash
# defina VITE_USE_EMULATORS=true no web/.env (veja web/.env.example)
firebase emulators:start --only auth,firestore,functions --project demo-sendflow
# em outro terminal:
cd web && npm run dev
```

> **Nota de ambiente:** em algumas máquinas Windows corporativas, o emulador do Firestore (baseado em Java/Netty) pode falhar ao iniciar com `Unable to establish loopback connection` — um problema conhecido de certas configurações de rede/segurança que bloqueiam o socket de loopback interno do Netty, mesmo com JDK 21 instalado. O emulador de **Auth** (Node.js puro) não é afetado. Nesse caso, a Opção A (projeto real) é o caminho alternativo para validar tudo, inclusive as Cloud Functions.

## Testes

```bash
# Testes unitários do frontend (funções puras: máscara de telefone, validação de
# agendamento, dark mode, paginação)
cd web && npm run test

# Testes das Firestore Security Rules (isolamento multi-tenant)
cd functions && npm run test:rules
```

`test:rules` sobe o Firebase Emulator Suite (`firebase emulators:exec --only firestore`) e roda os testes contra ele com `@firebase/rules-unit-testing` — está sujeito à mesma limitação de ambiente do emulador do Firestore descrita acima.

## Deploy

```bash
cd web && npm run build
cd ../functions && npm run build
cd .. && firebase deploy
```

Requer estar autenticado (`firebase login`) e ter um projeto configurado (`firebase use --add`). O Hosting serve `web/dist`; as regras e índices do Firestore e as Cloud Functions são publicados a partir da raiz.

## Decisões técnicas

- **Modelagem de dados:** `connections`, `contacts` e `messages` são collections de nível raiz (sem subcoleções), cada documento carregando um campo `clientId` denormalizado. Isso permite tanto às Security Rules quanto às queries do client isolar os dados por tenant sem precisar de leituras auxiliares (`get()`).
- **Isolamento multi-tenant:** toda leitura/escrita é validada em `firestore.rules` comparando `clientId` com `request.auth.uid`. Importante: para uma *query de coleção* (list), o Firestore só autoriza se a própria query já filtra pelos mesmos campos que a regra usa — por isso as queries de `contacts`/`messages` filtram por `clientId` além de `connectionId`, não só o documento carrega o campo.
- **Transição automática de status:** a Cloud Function agendada `flipDueMessages` (`onSchedule`, a cada 1 minuto) é a única responsável por mudar mensagens de `agendada` para `enviada` — o client nunca faz essa transição diretamente, inclusive as Security Rules bloqueiam essa mudança de status via update do client.
- **Exclusão em cascata:** ao excluir uma `connection`, a Cloud Function `cascadeDeleteConnection` (trigger `onDocumentDeleted`) remove em lote os `contacts` e `messages` associados, evitando dados órfãos.
- **CRUD direto do client:** operações triviais (criar/editar/excluir conexões, contatos e mensagens) são escritas diretas do SDK do Firestore, protegidas pelas Security Rules — Cloud Functions ficam reservadas para o que exige execução confiável no backend (agendamento, cascade delete).
- **Paradigma funcional:** sem classes em nenhuma camada — componentes React funcionais, hooks para acesso a dados em tempo real (`onSnapshot`), e Cloud Functions como funções exportadas simples.
