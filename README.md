
# 📄 Documentação de Sistema: TechLab Manager

**Instituição:** EEEP Professor Sebastião Vasconcelos Sobrinho
**Projeto:** Prática Integrada de Quality Assurance (QA) e Desenvolvimento
**Versão:** 1.0

---

## 📌 1. Visão Geral do Produto
O **TechLab Manager** é um sistema web responsivo desenvolvido para gerenciar o fluxo de empréstimo e devolução de equipamentos (notebooks, tablets, kits de robótica, cabos, etc.) do laboratório de informática. 

**Arquitetura de Teste:** Para viabilizar os testes End-to-End (E2E) de forma isolada, a aplicação funcionará 100% no cliente (Client-side). Os dados serão persistidos localmente utilizando o `LocalStorage` do navegador em formato JSON, simulando o comportamento de uma API real.

---

## ⚙️ 2. Estrutura de Dados (Mock no LocalStorage)

O sistema deve inicializar o `LocalStorage` com uma chave chamada `techlab_db` contendo um array de objetos caso a base esteja vazia no primeiro carregamento.

**Estrutura do JSON Esperado:**
```json
[
  {
    "id": 1,
    "nome": "Notebook Dell Inspiron",
    "patrimonio": "EEEP-NB-001",
    "categoria": "Computadores",
    "status": "Disponível",
    "responsavel_atual": ""
  },
  {
    "id": 2,
    "nome": "Kit Arduino Mega",
    "patrimonio": "EEEP-ROB-015",
    "categoria": "Robótica",
    "status": "Emprestado",
    "responsavel_atual": "Maria Silva (3º Ano)"
  }
]
```

---

## 📋 3. Requisitos Funcionais (RF)

As ações que o sistema deve permitir ao usuário realizar. Base para a escrita dos cenários BDD (Gherkin).

* **RF01 - Autenticação Simulada:** O sistema deve possuir uma tela de login. Ao inserir usuário "admin" e senha "12345", o sistema salva um token fictício no `SessionStorage` e redireciona para o Dashboard. Credenciais inválidas devem retornar mensagem de erro.
* **RF02 - Listagem de Equipamentos:** O Dashboard deve exibir todos os equipamentos salvos no `LocalStorage` em uma tabela ou grid de cards.
* **RF03 - Cadastro de Novo Equipamento:** O sistema deve conter um formulário para adição de itens. Ao salvar, o novo objeto é inserido no array do `LocalStorage` e a lista na tela é atualizada imediatamente.
* **RF04 - Empréstimo de Equipamento:** Itens com status "Disponível" devem exibir o botão "Emprestar". O clique abre um modal solicitando o "Nome do Responsável". Ao confirmar, o status muda para "Emprestado" e o `LocalStorage` é atualizado.
* **RF05 - Devolução de Equipamento:** Itens com status "Emprestado" devem exibir o botão "Devolver". O clique limpa o campo "Responsável", altera o status para "Disponível" e atualiza o `LocalStorage`.
* **RF06 - Exclusão de Equipamento:** O sistema deve permitir a remoção de um item da base, apagando-o definitivamente do `LocalStorage` mediante um alerta de confirmação.

---

## 🛑 4. Regras de Negócio (RN)

Restrições e validações do sistema. Base para os Casos de Teste de exceção e fluxos alternativos.

* **RN01 - Campos Obrigatórios:** No cadastro, `Nome`, `Patrimônio` e `Categoria` não podem ser vazios. O sistema deve impedir a submissão e alertar o usuário.
* **RN02 - Patrimônio Único:** É proibido cadastrar dois equipamentos com o mesmo número de patrimônio. O sistema deve exibir: *"Erro: Número de patrimônio já cadastrado."*
* **RN03 - Bloqueio de Duplo Empréstimo:** Um equipamento com status "Emprestado" não pode sofrer nova ação de empréstimo até sua devolução.
* **RN04 - Validação de Responsável:** O modal de empréstimo exige que o nome do responsável contenha no mínimo 3 caracteres para ser concluído.

---

## 🚀 5. Requisitos Não Funcionais (RNF) e Diretrizes de QA

Critérios de qualidade técnica e preparativos essenciais para a automação de testes.

* **RNF01 - Mapeamento para Automação (Testabilidade):** Todos os elementos interativos da interface (botões, inputs de texto, modais) devem conter o atributo `data-testid` (ex: `data-testid="input-nome"`). Isso garante a estabilidade dos scripts do Robot Framework.
* **RNF02 - Feedback Visual (UX):** Ações de sucesso (cadastro, empréstimo, exclusão) devem gerar um alerta visual (Toast/Snackbar) na tela por 3 segundos. Os testes automatizados validarão a exibição destes alertas.
* **RNF03 - Responsividade:** A interface deve adaptar-se a resoluções de desktop e dispositivos móveis.
* **RNF04 - Isolamento de Testes (Setup/Teardown):** A equipe de automação deve configurar o Robot Framework para executar o comando `window.localStorage.clear()` antes de cada suíte de testes E2E, garantindo um ambiente limpo.
```
