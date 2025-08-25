const pool = require('../config/database.js');

// Função para CRIAR um novo distribuidor
exports.create = async (req, res) => {
    try {
        if (!req.body.nome) {
            return res.status(400).json({ message: "O nome do distribuidor não pode ser vazio!" });
        }
        const { nome, cnpj, contato_nome, contato_email, telefone } = req.body;
        const status = req.body.status || 'ativo';
        const query = `
            INSERT INTO distribuidores (nome, cnpj, contato_nome, contato_email, telefone, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [nome, cnpj, contato_nome, contato_email, telefone, status];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]); // SUGESTÃO: Usando res.json() e extraindo o objeto de 'rows'

    } catch (error) {
        res.status(500).json({ message: error.message || "Ocorreu um erro ao criar o distribuidor." });
    }
};

// Função para LISTAR TODOS os distribuidores ATIVOS
exports.findAll = async (req, res) => {
    try {
        // SUGESTÃO: Adicionado filtro por status = 'ativo' para consistência
        const query = "SELECT * FROM distribuidores WHERE status = 'ativo' ORDER BY nome ASC";
        const { rows } = await pool.query(query);
        res.json(rows); // SUGESTÃO: Usando res.json()
    } catch (error) {
        res.status(500).json({ message: error.message || "Ocorreu um erro ao buscar os distribuidores." });
    }
};

// Função para BUSCAR UM distribuidor pelo ID
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'SELECT * FROM distribuidores WHERE id = $1';
        const { rows } = await pool.query(query, [id]);

        if (rows.length > 0) {
            res.json(rows[0]); // SUGESTÃO: Usando res.json() e enviando o objeto diretamente
        } else {
            res.status(404).json({ message: `Não foi possível encontrar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar o distribuidor com id=" + req.params.id });
    }
};

// Função para ATUALIZAR um distribuidor
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const campos = req.body;
        const chaves = Object.keys(campos);

        if (chaves.length === 0) {
            return res.status(400).json({ message: "O corpo da requisição não pode ser vazio para atualização." });
        }

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const chave of chaves) {
            setClauses.push(`"${chave}" = $${paramIndex}`);
            values.push(campos[chave]);
            paramIndex++;
        }

        setClauses.push(`data_atualizacao = NOW()`);
        values.push(id);

        // SUGESTÃO: Adicionado RETURNING * para retornar o objeto atualizado
        const query = `
            UPDATE distribuidores 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        
        const { rows } = await pool.query(query, values);
        
        if (rows.length > 0) {
            // SUGESTÃO: Retorna o objeto atualizado para o frontend
            res.json({ message: "Distribuidor atualizado com sucesso.", distributor: rows[0] });
        } else {
            res.status(404).json({ message: `Não foi possível encontrar e atualizar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO DETALHADO AO ATUALIZAR:", error);
        res.status(500).json({ message: "Erro ao atualizar o distribuidor com id=" + req.params.id });
    }
};

// Função para DELETAR (desativar) um distribuidor
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `
            UPDATE distribuidores 
            SET status = 'inativo', data_atualizacao = NOW() 
            WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 1) {
            res.json({ message: "Distribuidor desativado com sucesso!" });
        } else {
            res.status(404).json({ message: `Não foi possível desativar o distribuidor com id=${id}. Talvez não tenha sido encontrado.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Não foi possível desativar o distribuidor com id=" + req.params.id });
    }
};