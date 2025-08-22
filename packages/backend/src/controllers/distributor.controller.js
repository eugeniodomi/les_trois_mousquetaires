// importando pool do database.js /config
const pool = require('../config/database.js');

// Função para CRIAR um novo distribuidor (EDITADA)
exports.create = async (req, res) => {
    try {
        // Validação básica dos dados recebidos
        if (!req.body.nome) {
            return res.status(400).send({ message: "O nome do distribuidor não pode ser vazio!" });
        }

        // Extrai os dados do corpo da requisição
        const { nome, cnpj, contato_nome, contato_email, telefone } = req.body;
        
        // NOVO: Define um status padrão se não for enviado na requisição
        const status = req.body.status || 'ativo';

        // Query atualizada para incluir a nova coluna 'status'
        const query = `
            INSERT INTO distribuidores (nome, cnpj, contato_nome, contato_email, telefone, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [nome, cnpj, contato_nome, contato_email, telefone, status];
        
        const result = await pool.query(query, values);
        res.status(201).send(result.rows[0]);

    } catch (error) {
        res.status(500).send({ message: error.message || "Ocorreu um erro ao criar o distribuidor." });
    }
};

// Função para LISTAR TODOS os distribuidores (NÃO PRECISA DE ALTERAÇÃO)
// O SELECT * já buscará as novas colunas 'status' e 'data_atualizacao'.
exports.findAll = async (req, res) => {
    try {
        const query = 'SELECT * FROM distribuidores ORDER BY nome ASC';
        const result = await pool.query(query);
        res.send(result.rows);
    } catch (error) {
        res.status(500).send({ message: error.message || "Ocorreu um erro ao buscar os distribuidores." });
    }
};

// Função para BUSCAR UM distribuidor pelo ID (NÃO PRECISA DE ALTERAÇÃO)
// O SELECT * já buscará as novas colunas 'status' e 'data_atualizacao'.
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'SELECT * FROM distribuidores WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            res.send(result.rows[0]);
        } else {
            res.status(404).send({ message: `Não foi possível encontrar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar o distribuidor com id=" + req.params.id });
    }
};

// Função para ATUALIZAR um distribuidor (EDITADA)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const campos = req.body;
        const chaves = Object.keys(campos);

        if (chaves.length === 0) {
            return res.status(400).send({ message: "O corpo da requisição não pode ser vazio para atualização." });
        }

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const chave of chaves) {
            setClauses.push(`"${chave}" = $${paramIndex}`);
            values.push(campos[chave]);
            paramIndex++;
        }

        // NOVO: Adiciona a atualização automática do campo 'data_atualizacao'
        // Isso garante que toda modificação seja registrada com a data/hora atual.
        setClauses.push(`data_atualizacao = NOW()`);

        values.push(id);

        const query = `
            UPDATE distribuidores 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex};
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rowCount === 1) {
            res.send({ message: "Distribuidor atualizado com sucesso." });
        } else {
            res.status(404).send({ message: `Não foi possível encontrar e atualizar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO DETALHADO AO ATUALIZAR:", error);
        res.status(500).send({ message: "Erro ao atualizar o distribuidor com id=" + req.params.id });
    }
};

// Função para DELETAR um distribuidor (LÓGICA ALTERADA para "Soft Delete")
// Em vez de apagar o registro, vamos apenas marcá-lo como 'inativo'.
// Isso preserva o histórico de cotações associado a este distribuidor.
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        // LÓGICA ALTERADA: Usamos UPDATE para setar o status para 'inativo' e registrar a data da atualização.
        const query = `
            UPDATE distribuidores 
            SET status = 'inativo', data_atualizacao = NOW() 
            WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 1) {
            // Mensagem ajustada para refletir a nova lógica.
            res.send({ message: "Distribuidor desativado com sucesso!" });
        } else {
            res.status(404).send({ message: `Não foi possível desativar o distribuidor com id=${id}. Talvez não tenha sido encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Não foi possível desativar o distribuidor com id=" + req.params.id });
    }
};