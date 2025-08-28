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
            // QUERY CORRIGIDA PARA INCLUIR data_cotacao
            const itemQuery = `
                INSERT INTO dados_cotacoes (
                    cotacao_id, produto_id, distribuidor_id, quantidade, valor_unitario,
                    valor_cout, valor_osc, valor_venda_final, dolar_cotacao, 
                    data_cotacao, -- <<< CAMPO ADICIONADO
                    data_retorno,
                    data_registro, data_atualizacao
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW());
            `;
            // VALORES CORRIGIDOS PARA INCLUIR item.data_cotacao
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
                item.data_cotacao || null, // <<< VALOR ADICIONADO
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
 * @description Lista todas as cotações mestras, incluindo a contagem de itens e a lista de distribuidores.
 */
exports.findAll = async (req, res) => {
  try {
    const query = `
      SELECT
        c.*,
        u.nome AS usuario_criador_nome,
        (
          SELECT COUNT(dc.id) 
          FROM dados_cotacoes dc 
          WHERE dc.cotacao_id = c.id
        ) as item_count,
        (
          SELECT json_agg(DISTINCT d.nome) 
          FROM dados_cotacoes dc
          -- <<< A CORREÇÃO ESTÁ AQUI: de "distribuidores_id" para "distribuidor_id"
          JOIN distribuidores d ON dc.distribuidor_id = d.id
          WHERE dc.cotacao_id = c.id
        ) as distribuidores_nomes
      FROM cotacoes c
      LEFT JOIN usuarios u ON c.usuario_criador_id = u.id
      ORDER BY c.data_criacao DESC;
    `;
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
        // A alteração principal é adicionar 'dc.produto_id' e 'dc.distribuidor_id' na subquery.
        const query = `
            SELECT
                c.*,
                u.nome as usuario_criador_nome,
                COALESCE(
                    (
                        SELECT json_agg(items_data)
                        FROM (
                            SELECT
                                dc.id, 
                                dc.produto_id,      -- <<< ✅ ID DO PRODUTO ADICIONADO
                                dc.distribuidor_id, -- <<< ✅ ID DO DISTRIBUIDOR ADICIONADO
                                dc.quantidade, 
                                dc.valor_unitario, 
                                dc.valor_venda_final, 
                                dc.data_retorno, 
                                dc.data_cotacao, 
                                dc.data_registro,
                                dc.valor_cout,
                                dc.valor_osc,
                                dc.dolar_cotacao, -- Adicionando o campo que faltava
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
            LEFT JOIN usuarios u ON c.usuario_criador_id = u.id
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

/**
 * @description Atualiza uma cotação mestre e todos os seus itens associados
 * dentro de uma única transação.
 */
exports.update = async (req, res) => {
    const { id } = req.params;
    // Separa os dados da cotação principal dos itens
    const { descricao, status, usuario_criador_id, itens_cotacao } = req.body;

    // Validações básicas
    if (!descricao || !status) {
        return res.status(400).json({ message: "Descrição e status são obrigatórios." });
    }
    if (!itens_cotacao || !Array.isArray(itens_cotacao)) {
        return res.status(400).json({ message: "A lista de itens da cotação é obrigatória." });
    }

    const client = await pool.connect(); // Pega uma conexão do pool para a transação

    try {
        await client.query('BEGIN'); // 1. Inicia a transação

        // 2. Atualiza os dados na tabela principal 'cotacoes'
        const updateCotacaoQuery = `
            UPDATE cotacoes 
            SET descricao = $1, status = $2 
            WHERE id = $3;
        `;
        await client.query(updateCotacaoQuery, [descricao, status, id]);

        // 3. Deleta todos os itens antigos para evitar duplicatas ou itens órfãos
        const deleteItensQuery = 'DELETE FROM dados_cotacoes WHERE cotacao_id = $1;';
        await client.query(deleteItensQuery, [id]);

        // 4. Insere os novos itens que vieram do frontend
        // Prepara uma promise para cada item a ser inserido
        const itemInsertPromises = itens_cotacao.map(item => {
            const insertItemQuery = `
                INSERT INTO dados_cotacoes (
                    cotacao_id, produto_id, distribuidor_id, quantidade, valor_unitario,
                    valor_cout, valor_osc, valor_venda_final, dolar_cotacao,
                    data_cotacao, data_retorno, data_registro, data_atualizacao
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW());
            `;
            const itemValues = [
                id,
                item.produto_id,
                item.distribuidor_id,
                item.quantidade,
                item.valor_unitario || null,
                item.valor_cout || null,
                item.valor_osc || null,
                item.valor_venda_final || null,
                item.dolar_cotacao || null,
                item.data_cotacao || null,
                item.data_retorno || null
            ];
            return client.query(insertItemQuery, itemValues);
        });

        // Executa todas as promises de inserção
        await Promise.all(itemInsertPromises);

        await client.query('COMMIT'); // 5. Se tudo deu certo, confirma as alterações

        res.status(200).json({ message: "Cotação atualizada com sucesso!" });

    } catch (error) {
        await client.query('ROLLBACK'); // 6. Se algo deu errado, desfaz tudo
        console.error("ERRO AO ATUALIZAR COTAÇÃO (BACKEND):", error);
        res.status(500).json({ message: "Erro interno no servidor ao atualizar a cotação." });
    
    } finally {
        client.release(); // Libera a conexão de volta para o pool
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
