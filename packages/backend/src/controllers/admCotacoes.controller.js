const pool = require('../config/database');

/**
 * @description Cria uma nova Cotação Mestre no sistema.
 */
exports.create = async (req, res) => {
    try {
        const { descricao, usuario_criador_id } = req.body;

        if (!descricao || !usuario_criador_id) {
            return res.status(400).json({ message: "A descrição e o ID do usuário criador são obrigatórios." });
        }
        
        // NOTA: Em um ambiente de produção real, o 'usuario_criador_id'
        // deveria vir de um token de autenticação (req.user.id), e não do corpo da requisição.

        const query = `
            INSERT INTO cotacoes (descricao, usuario_criador_id, status, data_criacao)
            VALUES ($1, $2, 'Aberta', NOW())
            RETURNING *;
        `;
        const values = [descricao, usuario_criador_id];

        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("ERRO AO CRIAR COTAÇÃO MESTRE:", error);
        res.status(500).json({ message: "Ocorreu um erro ao criar a cotação." });
    }
};

/**
 * @description Lista todas as cotações mestras cadastradas.
 */
exports.findAll = async (req, res) => {
    try {
        const query = "SELECT * FROM cotacoes ORDER BY data_criacao DESC";
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("ERRO AO LISTAR COTAÇÕES:", error);
        res.status(500).json({ message: "Ocorreu um erro ao buscar as cotações." });
    }
};

/**
 * @description Busca uma cotação mestre pelo ID e todos os seus itens associados.
 */
exports.findOne = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                c.*,
                COALESCE(
                    (
                        SELECT json_agg(items_data)
                        FROM (
                            SELECT 
                                dc.id, dc.quantidade, dc.valor_unitario, dc.valor_venda_final,
                                p.nome as produto_nome, p.sku as produto_sku,
                                d.nome as distribuidor_nome
                            FROM dados_cotacoes dc
                            JOIN produtos p ON dc.produto_id = p.id
                            JOIN distribuidores d ON dc.distribuidor_id = d.id
                            WHERE dc.cotacao_id = c.id
                        ) as items_data
                    ), '[]'::json
                ) as itens
            FROM cotacoes c
            WHERE c.id = $1;
        `;
        
        const { rows } = await pool.query(query, [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: `Cotação com id=${id} não encontrada.` });
        }
    } catch (error) {
        console.error("ERRO AO BUSCAR COTAÇÃO ÚNICA:", error);
        res.status(500).json({ message: "Erro ao buscar a cotação com id=" + req.params.id });
    }
};

/**
 * @description Atualiza uma cotação (ex: mudar a descrição ou o status).
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const campos = req.body;
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

        if (campos.status && campos.status.toLowerCase() === 'fechada') {
            setClauses.push(`data_fechamento = NOW()`);
        }

        values.push(id);

        const query = `
            UPDATE cotacoes 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        
        const { rows } = await pool.query(query, values);
        
        if (rows.length > 0) {
            res.json({ message: "Cotação atualizada com sucesso.", cotacao: rows[0] });
        } else {
            res.status(404).json({ message: `Não foi possível encontrar e atualizar a cotação com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO AO ATUALIZAR COTAÇÃO:", error);
        res.status(500).json({ message: "Erro ao atualizar a cotação com id=" + req.params.id });
    }
};

/**
 * @description Deleta (desativa) uma cotação, mudando seu status para 'Cancelada'.
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE cotacoes 
            SET status = 'Cancelada'
            WHERE id = $1
            RETURNING id;
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount > 0) {
            res.json({ message: "Cotação cancelada com sucesso!" });
        } else {
            res.status(404).json({ message: `Não foi possível cancelar a cotação com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO AO CANCELAR COTAÇÃO:", error);
        res.status(500).json({ message: "Não foi possível cancelar a cotação com id=" + req.params.id });
    }
};