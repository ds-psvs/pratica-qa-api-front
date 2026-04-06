const express = require('express');
const cors = require('cors');

// Adicione estas duas linhas aqui:
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(cors());
app.use(express.json());

// Adicione esta linha para ativar a rota da documentação:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Banco de dados em memória (reseta ao reiniciar o servidor)
let equipamentos = [
    { id: 1, nome: "Notebook Dell Inspiron", patrimonio: "EEEP-NB-001", categoria: "Computadores", status: "Disponível", responsavel_atual: "" },
    { id: 2, "nome": "Kit Arduino Mega", patrimonio: "EEEP-ROB-015", categoria: "Robótica", status: "Emprestado", responsavel_atual: "Maria Silva" }
];

// Utilitário para gerar novo ID
const gerarId = () => equipamentos.length > 0 ? Math.max(...equipamentos.map(e => e.id)) + 1 : 1;

// --- ROTAS DA API ---

// 1. GET /equipamentos - Listar todos
app.get('/equipamentos', (req, res) => {
    res.status(200).json(equipamentos);
});

// 2. GET /equipamentos/:id - Buscar um específico
app.get('/equipamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = equipamentos.find(e => e.id === id);
    if (!item) return res.status(404).json({ erro: "Equipamento não encontrado." });
    res.status(200).json(item);
});

// 3. POST /equipamentos - Cadastrar novo
app.post('/equipamentos', (req, res) => {
    const { nome, patrimonio, categoria } = req.body;

    if (!nome || !patrimonio || !categoria) {
        return res.status(400).json({ erro: "Campos nome, patrimonio e categoria são obrigatórios." });
    }

    if (equipamentos.find(e => e.patrimonio === patrimonio)) {
        return res.status(400).json({ erro: "Número de patrimônio já cadastrado." });
    }

    const novoEquipamento = {
        id: gerarId(),
        nome,
        patrimonio,
        categoria,
        status: "Disponível",
        responsavel_atual: ""
    };

    equipamentos.push(novoEquipamento);
    res.status(201).json(novoEquipamento); // 201 Created
});

// 4. PUT /equipamentos/:id - Editar equipamento
app.put('/equipamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, categoria } = req.body;
    
    const index = equipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ erro: "Equipamento não encontrado." });

    if (!nome || !categoria) {
        return res.status(400).json({ erro: "Campos nome e categoria são obrigatórios." });
    }

    // Atualiza mantendo o patrimônio, status e responsável intactos
    equipamentos[index].nome = nome;
    equipamentos[index].categoria = categoria;

    res.status(200).json(equipamentos[index]);
});

// 5. DELETE /equipamentos/:id - Excluir equipamento
app.delete('/equipamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = equipamentos.findIndex(e => e.id === id);
    
    if (index === -1) return res.status(404).json({ erro: "Equipamento não encontrado." });

    equipamentos.splice(index, 1);
    res.status(204).send(); // 204 No Content
});

// 6. POST /equipamentos/:id/emprestar - Registrar empréstimo
app.post('/equipamentos/:id/emprestar', (req, res) => {
    const id = parseInt(req.params.id);
    const { responsavel_atual } = req.body;
    
    const index = equipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ erro: "Equipamento não encontrado." });

    if (equipamentos[index].status === "Emprestado") {
        return res.status(400).json({ erro: "Equipamento já está emprestado." });
    }

    if (!responsavel_atual || responsavel_atual.length < 3) {
        return res.status(400).json({ erro: "Nome do responsável inválido (mínimo 3 caracteres)." });
    }

    equipamentos[index].status = "Emprestado";
    equipamentos[index].responsavel_atual = responsavel_atual;

    res.status(200).json(equipamentos[index]);
});

// 7. POST /equipamentos/:id/devolver - Registrar devolução
app.post('/equipamentos/:id/devolver', (req, res) => {
    const id = parseInt(req.params.id);
    
    const index = equipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ erro: "Equipamento não encontrado." });

    equipamentos[index].status = "Disponível";
    equipamentos[index].responsavel_atual = "";

    res.status(200).json(equipamentos[index]);
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 TechLab API rodando na porta ${PORT}`);
    console.log(`Teste em: http://localhost:${PORT}/equipamentos`);
});