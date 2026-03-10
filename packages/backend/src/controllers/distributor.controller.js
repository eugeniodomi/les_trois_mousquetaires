const pool = require('../config/database.js');

// Função para CRIAR um novo distribuidor
exports.create = async (req, res) => {
    try {
        // Assumindo que seu middleware de autenticação coloca o ID do usuário em req.user.id
        const usuarioId = req.user?.id; // Usando optional chaining para segurança
        if (!usuarioId) {
            return res.status(403).json({ message: "Ação não permitida. Usuário não autenticado." });
        }

        if (!req.body.nome) {
            return res.status(400).json({ message: "O nome do distribuidor não pode ser vazio!" });
        }
        const { nome, cnpj, contato_nome, contato_email, telefone } = req.body;
        const status = req.body.status || 'ativo';
        
        const query = `
            INSERT INTO distribuidores 
                (nome, cnpj, contato_nome, contato_email, telefone, status, usuario_criador_id, usuario_atualizacao_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
            RETURNING *;
        `;
        const values = [nome, cnpj, contato_nome, contato_email, telefone, status, usuarioId];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("ERRO DETALHADO AO CRIAR:", error);
        res.status(500).json({ message: error.message || "Ocorreu um erro ao criar o distribuidor." });
    }
};

// Função para LISTAR TODOS os distribuidores ATIVOS
exports.findAll = async (req, res) => {
    try {
        const query = "SELECT * FROM distribuidores WHERE status = 'ativo' ORDER BY nome ASC";
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("ERRO AO BUSCAR TODOS:", error);
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
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: `Não foi possível encontrar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO AO BUSCAR UM:", error);
        res.status(500).json({ message: "Erro ao buscar o distribuidor com id=" + req.params.id });
    }
};

// Função para ATUALIZAR um distribuidor
exports.update = async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            return res.status(403).json({ message: "Ação não permitida. Usuário não autenticado." });
        }

        const id = req.params.id;
        const campos = req.body;

        delete campos.id;
        delete campos.data_cadastro;
        delete campos.data_atualizacao;
        delete campos.usuario_criador_id;

        const chaves = Object.keys(campos);

        if (chaves.length === 0) {
            return res.status(400).json({ message: "O corpo da requisição não pode ser vazio." });
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
        setClauses.push(`usuario_atualizacao_id = $${paramIndex}`);
        values.push(usuarioId);
        paramIndex++;

        values.push(id);

        const query = `
            UPDATE distribuidores 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        
        const { rows } = await pool.query(query, values);
        
        if (rows.length > 0) {
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
        console.error("ERRO AO DELETAR:", error);
        res.status(500).json({ message: "Não foi possível desativar o distribuidor com id=" + req.params.id });
    }
};

// Buscar analytics para o dashboard de distribuidores
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Competitividade do Distribuidor (Win rate / Frequência de vitórias)
        // Como o status de ganho da cotação não está trivial, vamos rankear pela quantidade
        // de itens ganhos / valor de negócio deles.
        const winRateQuery = `
            SELECT 
                d.nome as distributor_name,
                COUNT(DISTINCT c.id) as quotes_won
            FROM distribuidores d
            LEFT JOIN dados_cotacoes dc ON d.id = dc.distribuidor_id
            LEFT JOIN cotacoes c ON dc.cotacao_id = c.id AND c.status = 'Fechada'
            GROUP BY d.id, d.nome
            ORDER BY quotes_won DESC
            LIMIT 5
        `;
        const winRateResult = await pool.query(winRateQuery);

        // 2. Volume de negócios por distribuidor (Soma de valor_venda_final em cotações)
        const volumeQuery = `
            SELECT 
                d.nome as distributor_name,
                COALESCE(SUM(dc.valor_venda_final * dc.quantidade), 0) as total_volume
            FROM distribuidores d
            LEFT JOIN dados_cotacoes dc ON d.id = dc.distribuidor_id
            LEFT JOIN cotacoes c ON dc.cotacao_id = c.id
            GROUP BY d.id, d.nome
            ORDER BY total_volume DESC
            LIMIT 5
        `;
        const volumeResult = await pool.query(volumeQuery);

        res.json({
            winRates: winRateResult.rows,
            volumes: volumeResult.rows
        });
    } catch (error) {
        console.error("Erro ao buscar analytics de distribuidores:", error.message);
        res.status(500).json({ message: "Erro no servidor ao buscar analytics de distribuidores." });
    }
};
