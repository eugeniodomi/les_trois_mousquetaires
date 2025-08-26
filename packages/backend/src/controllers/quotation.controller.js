const pool = require('../config/database');

// --- CRUD para os ITENS da Cotação (tabela dados_cotacoes) ---

/**
 * @description Cria um novo item de proposta em uma cotação existente.
 * Esta função corresponde a adicionar a proposta de um distribuidor para um produto.
 */
exports.create = async (req, res) => {
  try {
    // Captura os dados do corpo da requisição, conforme a estrutura REAL do banco de dados.
    const {
      cotacao_id,
      produto_id,
      distribuidor_id,
      valor_cout,
      valor_osc,
      valor_venda_final,
      valor_unitario,
      quantidade,
      dolar_cotacao,
      data_retorno,
      data_cotacao
    } = req.body;

    // Validação de campos essenciais
    if (!cotacao_id || !produto_id || !distribuidor_id || !valor_unitario || !quantidade) {
      return res.status(400).send({ message: "Os campos 'cotacao_id', 'produto_id', 'distribuidor_id', 'valor_unitario' e 'quantidade' são obrigatórios." });
    }

    // A query de inserção agora usa as colunas corretas da tabela 'dados_cotacoes'.
    const query = `
      INSERT INTO dados_cotacoes (
        cotacao_id, produto_id, distribuidor_id,
        valor_cout, valor_osc, valor_venda_final, valor_unitario, quantidade,
        dolar_cotacao, data_retorno, data_cotacao,
        data_registro, data_atualizacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      cotacao_id, produto_id, distribuidor_id,
      valor_cout, valor_osc, valor_venda_final, valor_unitario, quantidade,
      dolar_cotacao, data_retorno, data_cotacao
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]); // Status 201: Created

  } catch (err) {
    console.error('ERRO AO CRIAR ITEM DE COTAÇÃO:', err.message);
    res.status(500).send('Erro no servidor ao criar o item da cotação.');
  }
};

/**
 * @description Busca todos os itens de cotação, com informações de produtos e distribuidores.
 */
exports.findAll = async (req, res) => {
  try {
    // Query com JOINs para trazer dados mais completos e úteis para o front-end
    const query = `
      SELECT
        dc.id,
        dc.cotacao_id,
        p.nome AS produto_nome,
        p.sku AS produto_sku,
        d.nome AS distribuidor_nome,
        dc.quantidade,
        dc.valor_unitario,
        dc.valor_venda_final,
        dc.data_registro
      FROM dados_cotacoes dc
      JOIN produtos p ON dc.produto_id = p.id
      JOIN distribuidores d ON dc.distribuidor_id = d.id
      ORDER BY dc.data_registro DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('ERRO AO BUSCAR ITENS DE COTAÇÃO:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

/**
 * @description Busca um item de cotação específico pelo seu ID.
 */
exports.findOne = async (req, res) => {
    try {
        const { id } = req.params;
        // Query com JOINs para trazer dados completos também na busca individual
        const query = `
          SELECT
            dc.*,
            p.nome AS produto_nome,
            d.nome AS distribuidor_nome
          FROM dados_cotacoes dc
          JOIN produtos p ON dc.produto_id = p.id
          JOIN distribuidores d ON dc.distribuidor_id = d.id
          WHERE dc.id = $1
        `;
        const { rows } = await pool.query(query, [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send({ message: `Item de cotação com id=${id} não encontrado.` });
        }
    } catch (err) {
        console.error('ERRO AO BUSCAR ITEM DE COTAÇÃO:', err.message);
        res.status(500).send('Erro no servidor');
    }
};

/**
 * @description Atualiza um item de cotação usando lógica dinâmica.
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);

    if (chaves.length === 0) {
      return res.status(400).send({ message: "Corpo da requisição não pode ser vazio para atualização." });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const chave of chaves) {
      // Evita que chaves primárias ou de controle sejam atualizadas pelo body
      if (chave !== 'id' && chave !== 'cotacao_id' && chave !== 'produto_id') { 
        setClauses.push(`"${chave}" = $${paramIndex}`);
        values.push(campos[chave]);
        paramIndex++;
      }
    }

    // Adiciona a atualização automática do campo 'data_atualizacao'
    setClauses.push(`data_atualizacao = NOW()`);
    values.push(id);

    const query = `
      UPDATE dados_cotacoes
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length > 0) {
      res.json({ message: "Item de cotação atualizado com sucesso.", item: rows[0] });
    } else {
      res.status(404).send({ message: `Não foi possível encontrar e atualizar o item com id=${id}.` });
    }
  } catch (err) {
    console.error('ERRO AO ATUALIZAR ITEM DE COTAÇÃO:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

/**
 * @description Deleta permanentemente um item de proposta de cotação.
 * Como esta tabela não possui status, a deleção é permanente (hard delete).
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM dados_cotacoes WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rowCount === 1) {
      res.json({ message: 'Item de cotação deletado com sucesso!' });
    } else {
      res.status(404).send({ message: `Item de cotação com id=${id} não foi encontrado.` });
    }
  } catch (err) {
    console.error('ERRO AO DELETAR ITEM DE COTAÇÃO:', err.message);
    res.status(500).send('Erro no servidor');
  }
};