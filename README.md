# SendFlow Broadcast

Teste técnico para a vaga de Desenvolvedor(a) Full Stack na SendFlow — aplicação de broadcast multi-tenant construída com **React + TypeScript + Vite** (`/web`) e **Firebase** (Authentication, Firestore, Cloud Functions) (`/functions`).

**Aplicação publicada:** https://sendflow-26d05.web.app — Hosting, Firestore (rules + indexes) e as duas Cloud Functions (`flipDueMessages`, `cascadeDeleteConnection`) estão no ar num projeto Firebase real (plano Blaze), e o fluxo completo foi validado de ponta a ponta nesse ambiente, incluindo a transição automática de status.

Para entender a arquitetura, a modelagem de dados e como o frontend e as Cloud Functions funcionam por dentro, ver [`ARQUITETURA.md`](ARQUITETURA.md).

## Estrutura

```
web/         # Frontend (Vite + React + TS + MUI + Tailwind)
functions/   # Firebase Cloud Functions (TypeScript)
firestore.rules, firestore.indexes.json, firebase.json   # Config do Firebase na raiz
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

Ver [`ARQUITETURA.md`](ARQUITETURA.md) para a modelagem de dados (sem subcoleções), a estratégia de isolamento multi-tenant nas Security Rules, como o frontend está organizado em camadas, e o funcionamento das duas Cloud Functions (transição automática de status e exclusão em cascata).
