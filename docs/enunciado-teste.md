# (Tec - UC) Desenvolvedor Full Stack 0926

## Teste Prático — Broadcast

O objetivo deste teste é desenvolver uma aplicação simplificada de **Broadcast**, utilizando **React, TypeScript e Firebase**.

O projeto deverá utilizar **Firebase Authentication, Firestore e Cloud Functions**.

Não esperamos um produto completo ou pronto para produção. Queremos avaliar principalmente sua capacidade de **estruturar uma aplicação, tomar decisões técnicas, organizar o código e implementar os requisitos propostos**.

---

### O projeto deve conter

#### Autenticação

- Implementar **login e cadastro** utilizando Firebase Authentication;
- Cada usuário cadastrado deverá representar um cliente da aplicação.

#### Conexões

O cliente deverá conseguir visualizar e gerenciar suas conexões.

Uma conexão possui:

- Nome.

Implementar as operações de **criação, leitura, edição e exclusão (CRUD)**.

#### Contatos

Cada conexão deverá possuir sua própria lista de contatos.

Um contato possui:

- Nome;
- Telefone.

Implementar as operações de **criação, leitura, edição e exclusão (CRUD)**.

#### Broadcast

Criar uma tela para envio de mensagens aos contatos de uma conexão.

O usuário deverá conseguir:

- Selecionar um ou mais contatos;
- Escrever a mensagem que deseja enviar;
- Enviar a mensagem imediatamente;
- Agendar uma mensagem para uma data e horário futuros;
- Visualizar as mensagens criadas;
- Filtrar entre mensagens **enviadas** e **agendadas**;
- Editar e excluir mensagens.

**Não é necessário realizar nenhum envio real de mensagens.** O disparo será apenas uma simulação.

Uma mensagem agendada deverá permanecer com status **"Agendada"** e mudar automaticamente para **"Enviada"** quando chegar o horário definido.

Essa alteração deverá acontecer no backend utilizando **Firebase Cloud Functions**, sem depender de o usuário estar com a aplicação aberta.

---

### Requisitos técnicos

1. A aplicação deverá seguir uma estrutura **SaaS multi-tenant**: cada cliente possui suas próprias conexões, e cada conexão possui seus respectivos contatos e mensagens.
2. Um cliente **não poderá visualizar ou manipular dados pertencentes a outro cliente**.
3. Utilize **Material UI** para componentes e **Tailwind CSS** para estilização.
4. O código deverá ser **limpo, organizado e de fácil manutenção**.
5. Não utilize orientação a objetos. O projeto deverá seguir o **paradigma funcional**.
6. Utilize os recursos de **tempo real do Firestore** sempre que aplicável.
7. O frontend deverá utilizar **Vite**.
8. **Não utilize subcoleções no Firestore.**
9. Organize o projeto separando:
    - `/functions` — Firebase Cloud Functions;
    - `/web` — aplicação frontend.
10. A modelagem dos dados, estrutura das collections e estratégia utilizada para garantir o isolamento entre clientes fazem parte da avaliação.

---

### Como enviar

1. Publique a aplicação utilizando **Firebase Hosting** e disponibilize um link funcional para avaliação.
2. Certifique-se de que o projeto publicado permita realizar todo o fluxo solicitado no teste.
3. Informe no formulário abaixo:
    - Seu **nome completo**;
    - Link da aplicação publicada.

Documentação do Firebase Hosting:
https://firebase.google.com/docs/hosting?hl=pt-br
