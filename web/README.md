# SendFlow Broadcast — Frontend

Frontend da aplicação, construído com **React 19 + TypeScript + Vite**, **Material UI** e **Tailwind CSS**.

Para visão geral do projeto, deploy e como tudo se conecta, ver o [README](../README.md) e a [arquitetura](../ARQUITETURA.md) na raiz do repositório.

## Comandos

```bash
npm install       # instalar dependências

npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # build de produção (gera dist/)
npm run preview   # servir o build de produção localmente

npm run test      # testes unitários (Vitest)
npm run lint      # lint (oxlint)
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com as credenciais do seu projeto Firebase (Console → ⚙️ Configurações do projeto → "Seus apps"):

```bash
cp .env.example .env
```

`VITE_USE_EMULATORS=true` conecta o app aos emuladores locais do Firebase (Auth/Firestore) em vez do projeto real — útil para desenvolvimento sem custo.
