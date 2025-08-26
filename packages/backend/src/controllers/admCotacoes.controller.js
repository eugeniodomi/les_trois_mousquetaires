// Importa a configuração do banco de dados
const pool = require('../config/database');

/**
 * @description Cria uma nova Cotação Mestre e todos os seus itens associados
 * dentro de uma única transação para garantir a integridade dos dados.
 */
exports.create = async (req, res) => {
    // 1. Extrai os dados da cotação mestre e o array de itens do corpo da requisição
    const { descricao, usuario_criador_id, itens_cotacao } = req.body;

    // 2. Validação dos dados recebidos
    if (!descricao || !usuario_criador_id) {
        return res.status(400).json({ message: "A descrição e o ID do usuário criador são obrigatórios." });
    }
    if (!itens_cotacao || !Array.isArray(itens_cotacao) || itens_cotacao.length === 0) {
        return res.status(400).json({ message: "É necessário enviar pelo menos um item para a cotação." });
    }

    // 3. Inicia a conexão com o cliente do pool do PostgreSQL
    const client = await pool.connect();

    try {
        // 4. Inicia a transação
        await client.query('BEGIN');

        // 5. Insere a cotação mestre na tabela 'cotacoes' e obtém o ID gerado
        const cotacaoQuery = `
            INSERT INTO cotacoes (descricao, usuario_criador_id, status, data_criacao)
            VALUES ($1, $2, 'Aberta', NOW())
            RETURNING id;
        `;
        const cotacaoValues = [descricao, usuario_criador_id];
        const cotacaoResult = await client.query(cotacaoQuery, cotacaoValues);
        const novaCotacaoId = cotacaoResult.rows[0].id;

        // 6. Prepara as queries para inserir todos os itens da cotação
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
                novaCotacaoId, // Usa o ID da cotação mestre recém-criada
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

        // 7. Executa todas as inserções dos itens em paralelo
        await Promise.all(itemPromises);

        // 8. Se tudo deu certo, commita a transação
        await client.query('COMMIT');

        // 9. Retorna a resposta de sucesso com o ID da nova cotação
        res.status(201).json({
            message: "Cotação e seus itens criados com sucesso!",
            cotacao_id: novaCotacaoId
        });

    } catch (error) {
        // 10. Se qualquer passo falhou, faz o rollback da transação
        await client.query('ROLLBACK');
        console.error("ERRO AO CRIAR COTAÇÃO EM TRANSAÇÃO:", error);
        res.status(500).json({ message: "Ocorreu um erro ao criar a cotação. Nenhuma informação foi salva." });

    } finally {
        // 11. Libera o cliente de volta para o pool, independentemente do resultado
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

        // --- ALTERAÇÃO APLICADA ---
        // Verifica se o ID fornecido é um número inteiro. Se não for, retorna um erro
        // 400 (Bad Request) em vez de causar um erro 500 no banco de dados.
        if (isNaN(parseInt(id, 10))) {
            return res.status(400).json({ message: `O ID da cotação deve ser um número. Valor recebido: '${id}'` });
        }
        // --- FIM DA ALTERAÇÃO ---

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
