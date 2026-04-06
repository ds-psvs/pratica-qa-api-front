
# 📄 Documentação de Sistema: TechLab Manager

**Instituição:** EEEP Professor Sebastião Vasconcelos Sobrinho
**Projeto:** Prática Integrada de Quality Assurance (QA) e Desenvolvimento
**Versão:** 2.0 (Atualizada com Busca, Filtros e Edição)

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
* **RF02 - Listagem de Equipamentos:** O Dashboard deve exibir todos os equipamentos salvos no `LocalStorage` em uma tabela.
* **RF03 - Cadastro de Novo Equipamento:** O sistema deve conter um formulário para adição de itens. Ao salvar, o novo objeto é inserido no array e a lista é atualizada.
* **RF04 - Empréstimo de Equipamento:** Itens com status "Disponível" devem exibir o botão "Emprestar". O clique abre um modal solicitando o "Nome do Responsável". Ao confirmar, o status muda para "Emprestado" e o `LocalStorage` é atualizado.
* **RF05 - Devolução de Equipamento:** Itens com status "Emprestado" devem exibir o botão "Devolver". O clique limpa o campo "Responsável", altera o status para "Disponível" e atualiza a base.
* **RF06 - Exclusão de Equipamento:** O sistema deve permitir a remoção de um item da base, apagando-o definitivamente mediante um alerta de confirmação.
* **RF07 - Editar Equipamento:** O sistema deve permitir alterar o "Nome" e a "Categoria" de um equipamento já cadastrado através de um modal de edição.
* **RF08 - Pesquisa Dinâmica:** Deve haver um campo de busca que filtre os equipamentos em tempo real pelo "Nome" ou "Patrimônio".
* **RF09 - Painel de Métricas (Dashboard):** O sistema deve exibir 3 cards contadores no topo da tela, atualizados em tempo real: Total de Equipamentos, Disponíveis e Emprestados.
* **RF10 - Filtro por Categoria:** O sistema deve possuir um dropdown (*select*) para filtrar a tabela exibindo apenas os itens de uma categoria específica (Computadores, Robótica ou Acessórios).

---

## 🛑 4. Regras de Negócio (RN)

Restrições e validações do sistema. Base para os Casos de Teste de exceção e fluxos alternativos.

* **RN01 - Campos Obrigatórios:** No cadastro e na edição, `Nome`, `Patrimônio` (apenas cadastro) e `Categoria` não podem ser vazios. O sistema deve impedir a submissão e alertar o usuário.
* **RN02 - Patrimônio Único:** É proibido cadastrar dois equipamentos com o mesmo número de patrimônio. O sistema deve exibir: *"Erro: Número de patrimônio já cadastrado."*
* **RN03 - Bloqueio de Duplo Empréstimo:** Um equipamento com status "Emprestado" não pode sofrer nova ação de empréstimo até sua devolução.
* **RN04 - Validação de Responsável:** O modal de empréstimo exige que o nome do responsável contenha no mínimo 3 caracteres para ser concluído.
* **RN05 - Bloqueio de Edição de Patrimônio:** No modal de edição (RF07), o campo "Patrimônio" deve estar bloqueado (somente leitura), impedindo sua alteração.
* **RN06 - Retorno Vazio (Busca/Filtro):** Se a pesquisa (RF08) ou o filtro (RF10) não encontrarem nenhum equipamento, a tabela deve ser ocultada e o sistema deve exibir a mensagem: *"Nenhum equipamento encontrado."*

---

## 🚀 5. Requisitos Não Funcionais (RNF) e Diretrizes de QA

Critérios de qualidade técnica e preparativos essenciais para a automação de testes.

* **RNF01 - Mapeamento para Automação (Testabilidade):** Todos os elementos interativos da interface (botões, inputs de texto, modais, cards de métrica) devem conter o atributo `data-testid`. Isso garante a estabilidade dos scripts do Robot Framework.
* **RNF02 - Feedback Visual (UX):** Ações de sucesso (cadastro, edição, empréstimo, exclusão) devem gerar um alerta visual tipo *Toast* na tela por 3 segundos. Os testes automatizados validarão a exibição destes alertas.
* **RNF03 - Responsividade:** A interface deve adaptar-se a resoluções de desktop e dispositivos móveis (simulando uso via tablet no laboratório).
* **RNF04 - Isolamento de Testes (Setup/Teardown):** A equipe de automação deve configurar o Robot Framework para executar o comando `Execute JavaScript window.localStorage.clear()` antes de cada suíte de testes E2E, garantindo um ambiente limpo a cada execução.
```