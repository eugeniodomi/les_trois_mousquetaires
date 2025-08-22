const pool = require('../config/database');

/**
 * Lista todas as cotações com informações de produtos, distribuidores e usuários.
 */
exports.findAll = async (req, res) => {
  try {
    const query = `
      SELECT 
        dc.*, 
        p.nome as produto_nome, 
        d.nome as distribuidor_nome,
        u.nome as usuario_nome
      FROM dados_cotacoes dc
      LEFT JOIN produtos p ON dc.produto_id = p.id
      LEFT JOIN distribuidores d ON dc.distribuidor_id = d.id
      LEFT JOIN usuarios u ON dc.usuario_id = u.id
      ORDER BY dc.data_registro DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

/**
 * Cria uma nova cotação.
 */
exports.create = async (req, res) => {
  try {
    // CORRIGIDO: Usando os nomes exatos das colunas do seu banco de dados.
    const { 
      produto_id, 
      distribuidor_id, 
      valor_cout,           // Nome alinhado com o banco
      valor_osc,
      valor_venda_final,    // Nome alinhado com o banco
      quantidade, 
      data_solicitacao, 
      data_retorno,
      usuario_id
      // Outros campos como 'dolar_cotacao' podem ser adicionados aqui se vierem do front-end
    } = req.body;

    // CORRIGIDO: Query de inserção usando os nomes de colunas corretos.
    const insertQuery = `
      INSERT INTO dados_cotacoes (
        produto_id, distribuidor_id, valor_cout, valor_osc, valor_venda_final, 
        quantidade, data_solicitacao, data_retorno, usuario_id, data_registro, data_atualizacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
      RETURNING *;
    `;

    const values = [
      produto_id, distribuidor_id, valor_cout, valor_osc, valor_venda_final, 
      quantidade, data_solicitacao, data_retorno, usuario_id
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error("ERRO AO CRIAR COTAÇÃO:", err.message);
    res.status(500).send('Erro no servidor ao criar cotação');
  }
};

/**
 * Busca uma cotação específica pelo ID.
 */
exports.findOne = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                dc.*, 
                p.nome as produto_nome, 
                d.nome as distribuidor_nome,
                u.nome as usuario_nome
            FROM dados_cotacoes dc
            LEFT JOIN produtos p ON dc.produto_id = p.id
            LEFT JOIN distribuidores d ON dc.distribuidor_id = d.id
            LEFT JOIN usuarios u ON dc.usuario_id = u.id
            WHERE dc.id = $1;
        `;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).send('Cotação não encontrada.');
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

/**
 * Atualiza uma cotação existente.
 * Esta função é dinâmica e se adapta aos campos enviados no corpo da requisição.
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const campos = req.body;
        const chaves = Object.keys(campos);

        if (chaves.length === 0) {
            return res.status(400).send({ message: "Corpo da requisição vazio." });
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

        const query = `
            UPDATE dados_cotacoes 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        
        const { rows } = await pool.query(query, values);
        
        if (rows.length === 0) {
            return res.status(404).send({ message: `Cotação com id=${id} não encontrada.` });
        }
        res.send({ message: "Cotação atualizada com sucesso.", cotacao: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

/**
 * Deleta uma cotação pelo ID.
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM dados_cotacoes WHERE id = $1;';
        const { rowCount } = await pool.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).send({ message: `Cotação com id=${id} não encontrada.` });
        }
        res.send({ message: "Cotação deletada com sucesso!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};
