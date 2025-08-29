// backend/src/controllers/admCotacoes.controller.js

// Importa a configuração do banco de dados
const pool = require('../config/database');

/**
 * @description Cria uma nova Cotação Mestre e todos os seus itens associados
 * dentro de uma única transação para garantir a integridade dos dados.
 */
exports.create = async (req, res) => {
    console.log("Backend recebeu para criação:", req.body); // Log para depuração

    const { descricao, usuario_criador_id, itens_cotacao } = req.body;

    if (!descricao || !usuario_criador_id) {
        return res.status(400).json({ message: "A descrição e o ID do usuário criador são obrigatórios." });
    }
    if (!itens_cotacao || !Array.isArray(itens_cotacao) || itens_cotacao.length === 0) {
        return res.status(400).json({ message: "É necessário enviar pelo menos um item para a cotação." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cotacaoQuery = `
            INSERT INTO cotacoes (descricao, usuario_criador_id, status, data_criacao)
            VALUES ($1, $2, 'Aberta', NOW())
            RETURNING id;
        `;
        const cotacaoValues = [descricao, usuario_criador_id];
        const cotacaoResult = await client.query(cotacaoQuery, cotacaoValues);
        const novaCotacaoId = cotacaoResult.rows[0].id;

        const itemPromises = itens_cotacao.map(item => {
            const itemQuery = `
                INSERT INTO dados_cotacoes (
                    cotacao_id, produto_id, distribuidor_id, quantidade, valor_unitario,
                    valor_cout, valor_osc, valor_venda_final, dolar_cotacao, data_retorno,
                    data_registro, data_atualizacao
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW());
            `;
            const itemValues = [
                novaCotacaoId,
                item.produto_id,
                item.distribuidor_id,
                item.quantidade,
                item.valor_unitario || null,
                item.valor_cout || null,
                item.valor_osc || null,
                item.valor_venda_final || null,
                item.dolar_cotacao || null,
                item.data_retorno || null
            ];
            return client.query(itemQuery, itemValues);
        });

        await Promise.all(itemPromises);
        await client.query('COMMIT');

        res.status(201).json({
            message: "Cotação e seus itens criados com sucesso!",
            cotacao_id: novaCotacaoId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("ERRO NA TRANSAÇÃO DO BACKEND:", error);
        res.status(500).json({ message: "Erro interno no servidor ao criar a cotação." });

    } finally {
        client.release();
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

        if (isNaN(parseInt(id, 10))) {
            return res.status(400).json({ message: `O ID da cotação deve ser um número. Valor recebido: '${id}'` });
        }

        // --- QUERY CORRIGIDA ---
        const query = `
            SELECT
                c.*,
                u.nome as usuario_criador_nome, -- ADICIONADO: Busca o nome do usuário criador
                COALESCE(
                    (
                        SELECT json_agg(items_data)
                        FROM (
                            SELECT
                                dc.id, 
                                dc.quantidade, 
                                dc.valor_unitario, 
                                dc.valor_venda_final, 
                                dc.data_retorno, 
                                dc.data_cotacao, 
                                dc.data_registro,
                                dc.valor_cout, -- <<< ADICIONADO
                                dc.valor_osc,   -- <<< ADICIONADO
                                p.nome as produto_nome, 
                                p.sku as produto_sku,
                                d.nome as distribuidor_nome
                            FROM dados_cotacoes dc
                            LEFT JOIN produtos p ON dc.produto_id = p.id
                            LEFT JOIN distribuidores d ON dc.distribuidor_id = d.id
                            WHERE dc.cotacao_id = c.id
                        ) as items_data
                    ), '[]'::json
                ) as itens_cotacao
            FROM cotacoes c
            LEFT JOIN usuarios u ON c.usuario_criador_id = u.id -- ADICIONADO: Junta com a tabela de usuários
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
 * A lógica foi aprimorada para gerenciar a data_fechamento automaticamente.
 */
exports.update = async (req, res) => {

    // ADICIONE ESTA LINHA
    console.log("--- EXECUTANDO UPDATE DE quotation.controller.js ---"); 
    console.log("DADOS RECEBIDOS:", req.body);
    
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
            // Ignora 'data_fechamento' no loop, pois será tratada pela lógica de status.
            if (chave !== 'id' && chave !== 'usuario_criador_id' && chave !== 'data_criacao' && chave !== 'data_fechamento') {
                setClauses.push(`"${chave}" = $${paramIndex}`);
                values.push(campos[chave]);
                paramIndex++;
            }
        }

        // Lógica explícita para tratar data_fechamento com base no status.
        if (campos.status) {
            const statusNormalizado = campos.status.toLowerCase();
            if (statusNormalizado === 'fechada') {
                setClauses.push(`data_fechamento = NOW()`);
            } else if (statusNormalizado === 'aberta') {
                setClauses.push(`data_fechamento = NULL`);
            }
        }

        if (setClauses.length === 0) {
             return res.status(400).json({ message: "Nenhum campo válido para atualização foi fornecido." });
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