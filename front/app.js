// --- CONFIGURAÇÃO INICIAL DO MOCK ---
const DB_KEY = 'techlab_db';

const mockInicial = [
    { id: 1, nome: "Notebook Dell Inspiron", patrimonio: "EEEP-NB-001", categoria: "Computadores", status: "Disponível", responsavel_atual: "" },
    { id: 2, nome: "Kit Arduino Mega", patrimonio: "EEEP-ROB-015", categoria: "Robótica", status: "Emprestado", responsavel_atual: "Maria Silva (3º Ano)" },
    { id: 3, nome: "Cabo HDMI 2m", patrimonio: "EEEP-AC-008", categoria: "Acessórios", status: "Disponível", responsavel_atual: "" }
];

function initDB() { if (!localStorage.getItem(DB_KEY)) saveDB(mockInicial); }
function getDB() { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }
function showToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// --- RF01: AUTENTICAÇÃO ---
function verificarSessao() {
    if (sessionStorage.getItem('token') === 'simulado_123') {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('login-view').classList.remove('active');
        document.getElementById('dashboard-view').classList.remove('hidden');
        carregarTabela();
    }
}

function realizarLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');

    if (user === 'admin' && pass === '12345') {
        sessionStorage.setItem('token', 'simulado_123');
        errorMsg.classList.add('hidden');
        verificarSessao();
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function realizarLogout() { sessionStorage.removeItem('token'); window.location.reload(); }

// --- RF08, RF09 e RF10: FILTROS E MÉTRICAS ---
function atualizarMetricas(dadosRenderizados) {
    document.getElementById('metric-total').textContent = dadosRenderizados.length;
    document.getElementById('metric-disponiveis').textContent = dadosRenderizados.filter(i => i.status === 'Disponível').length;
    document.getElementById('metric-emprestados').textContent = dadosRenderizados.filter(i => i.status === 'Emprestado').length;
}

document.getElementById('search-input').addEventListener('input', carregarTabela);
document.getElementById('filter-categoria').addEventListener('change', carregarTabela);

// --- LISTAGEM ---
function carregarTabela() {
    let db = getDB();
    const termo = document.getElementById('search-input').value.toLowerCase();
    const categoria = document.getElementById('filter-categoria').value;

    // Aplica Filtros
    if (categoria !== 'Todos') db = db.filter(i => i.categoria === categoria);
    if (termo) db = db.filter(i => i.nome.toLowerCase().includes(termo) || i.patrimonio.toLowerCase().includes(termo));

    atualizarMetricas(db);

    const tbody = document.getElementById('tabela-body');
    const emptyState = document.getElementById('empty-state');
    tbody.innerHTML = '';

    if (db.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        db.forEach(item => {
            const tr = document.createElement('tr');
            const isDisponivel = item.status === 'Disponível';
            tr.innerHTML = `
                <td>${item.patrimonio}</td>
                <td>${item.nome}</td>
                <td>${item.categoria}</td>
                <td><span class="status-badge ${isDisponivel ? 'status-disponivel' : 'status-emprestado'}">${item.status}</span></td>
                <td>${item.responsavel_atual || '-'}</td>
                <td>
                    ${isDisponivel 
                        ? `<button data-testid="btn-emprestar-${item.id}" onclick="prepararEmprestimo(${item.id}, '${item.nome}')" class="btn btn-secondary btn-small">Emprestar</button>` 
                        : `<button data-testid="btn-devolver-${item.id}" onclick="devolverEquipamento(${item.id})" class="btn btn-primary btn-small">Devolver</button>`
                    }
                    <button data-testid="btn-editar-${item.id}" onclick="abrirModalEdicao(${item.id})" class="btn btn-secondary btn-small" style="background-color: #eee;">Editar</button>
                    <button data-testid="btn-excluir-${item.id}" onclick="excluirEquipamento(${item.id})" class="btn btn-secondary btn-small" style="color: red; border-color: red;">X</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// --- GESTÃO DE MODAIS ---
function fecharModais() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function abrirModalCadastro() {
    document.getElementById('cad-error').classList.add('hidden');
    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-patrimonio').value = '';
    document.getElementById('cad-categoria').value = '';
    document.getElementById('modal-cadastro').classList.remove('hidden');
}

// --- RF03: CADASTRO ---
function salvarEquipamento() {
    const nome = document.getElementById('cad-nome').value.trim();
    const patrimonio = document.getElementById('cad-patrimonio').value.trim();
    const categoria = document.getElementById('cad-categoria').value;
    const errorMsg = document.getElementById('cad-error');

    if (!nome || !patrimonio || !categoria) {
        errorMsg.textContent = "Erro: Todos os campos são obrigatórios.";
        errorMsg.classList.remove('hidden');
        return;
    }

    const db = getDB();
    if (db.find(i => i.patrimonio === patrimonio)) {
        errorMsg.textContent = "Erro: Número de patrimônio já cadastrado.";
        errorMsg.classList.remove('hidden');
        return;
    }

    const novoId = db.length > 0 ? Math.max(...db.map(i => i.id)) + 1 : 1;
    db.push({ id: novoId, nome, patrimonio, categoria, status: "Disponível", responsavel_atual: "" });

    saveDB(db); fecharModais(); carregarTabela(); showToast("Equipamento cadastrado com sucesso!");
}

// --- RF07: EDIÇÃO ---
function abrirModalEdicao(id) {
    const item = getDB().find(i => i.id === id);
    document.getElementById('edit-error').classList.add('hidden');
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-patrimonio').value = item.patrimonio; // Bloqueado
    document.getElementById('edit-nome').value = item.nome;
    document.getElementById('edit-categoria').value = item.categoria;
    document.getElementById('modal-edicao').classList.remove('hidden');
}

function salvarEdicao() {
    const id = parseInt(document.getElementById('edit-id').value);
    const nome = document.getElementById('edit-nome').value.trim();
    const categoria = document.getElementById('edit-categoria').value;
    const errorMsg = document.getElementById('edit-error');

    if (!nome || !categoria) {
        errorMsg.textContent = "Erro: Nome e Categoria são obrigatórios.";
        errorMsg.classList.remove('hidden');
        return;
    }

    const db = getDB();
    const index = db.findIndex(i => i.id === id);
    db[index].nome = nome;
    db[index].categoria = categoria;

    saveDB(db); fecharModais(); carregarTabela(); showToast("Equipamento atualizado!");
}

// --- EMPRÉSTIMO, DEVOLUÇÃO E EXCLUSÃO (Mantidos) ---
function prepararEmprestimo(id, nome) {
    document.getElementById('emp-error').classList.add('hidden');
    document.getElementById('emp-responsavel').value = '';
    document.getElementById('emp-id-equipamento').value = id;
    document.getElementById('emp-nome-equipamento').textContent = `Equipamento: ${nome}`;
    document.getElementById('modal-emprestimo').classList.remove('hidden');
}

function confirmarEmprestimo() {
    const responsavel = document.getElementById('emp-responsavel').value.trim();
    const id = parseInt(document.getElementById('emp-id-equipamento').value);
    if (responsavel.length < 3) {
        document.getElementById('emp-error').textContent = "Nome deve ter no mínimo 3 caracteres.";
        document.getElementById('emp-error').classList.remove('hidden'); return;
    }
    const db = getDB(); const index = db.findIndex(i => i.id === id);
    if (db[index].status === 'Emprestado') return;
    db[index].status = "Emprestado"; db[index].responsavel_atual = responsavel;
    saveDB(db); fecharModais(); carregarTabela(); showToast("Empréstimo registrado!");
}

function devolverEquipamento(id) {
    const db = getDB(); const index = db.findIndex(i => i.id === id);
    db[index].status = "Disponível"; db[index].responsavel_atual = "";
    saveDB(db); carregarTabela(); showToast("Equipamento devolvido!");
}

function excluirEquipamento(id) {
    if (confirm("Deseja excluir este equipamento?")) {
        saveDB(getDB().filter(i => i.id !== id)); carregarTabela(); showToast("Equipamento excluído!");
    }
}

window.onload = () => { initDB(); verificarSessao(); };