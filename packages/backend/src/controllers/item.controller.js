const pool = require('../config/database');

// ## CRUD DOS PRODUTOS ##

// Lógica para obter todos os produtos (apenas os ativos)
exports.findAll = async (req, res) => {
  try {
    // EDITADO: A query agora busca na tabela 'produtos' e filtra por status 'ativo'.
    const { rows } = await pool.query("SELECT * FROM produtos WHERE status = 'ativo' ORDER BY nome ASC");
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para criar um novo produto
exports.create = async (req, res) => {
  try {
    // EDITADO: Extrai todos os novos campos do corpo da requisição.
    const { nome, descricao, unidade_medida, sku, categoria_id } = req.body;
    const status = req.body.status || 'ativo'; // Padrão 'ativo'

    if (!nome || !unidade_medida) {
        return res.status(400).send({ message: "Nome e Unidade de Medida são obrigatórios." });
    }

    // EDITADO: Query de inserção com as novas colunas.
    // data_criacao e data_atualizacao são preenchidas automaticamente.
    const query = `
      INSERT INTO produtos (nome, descricao, unidade_medida, sku, status, categoria_id, data_criacao, data_atualizacao) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
      RETURNING *
    `;
    const values = [nome, descricao, unidade_medida, sku, status, categoria_id];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]); // Retorna 201 Created com o novo produto
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para atualizar um produto (LÓGICA MELHORADA E DINÂMICA)
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
      setClauses.push(`"${chave}" = $${paramIndex}`);
      values.push(campos[chave]);
      paramIndex++;
    }

    // NOVO: Adiciona a atualização automática do campo 'data_atualizacao'.
    setClauses.push(`data_atualizacao = NOW()`);
    values.push(id);

    const query = `
      UPDATE produtos 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length > 0) {
        res.json({ message: "Produto atualizado com sucesso.", produto: rows[0] });
    } else {
        res.status(404).send({ message: `Não foi possível encontrar e atualizar o produto com id=${id}.` });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para deletar um produto (LÓGICA ALTERADA para "Soft Delete")
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    // EDITADO: Em vez de DELETAR, atualizamos o status para 'inativo'.
    const query = `
        UPDATE produtos 
        SET status = 'inativo', data_atualizacao = NOW() 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 1) {
      res.json({ message: 'Produto desativado com sucesso!' });
    } else {
      res.status(404).send({ message: `Produto com id=${id} não encontrado.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para buscar produtos por nome ou SKU (FUNÇÃO MELHORADA)
exports.search = async (req, res) => {
  try {
    const { q } = req.query; // Pega o termo de busca (ex: /produtos/search?q=parafuso)

    if (!q) {
        return res.status(400).send({ message: "É necessário um termo de busca." });
    }

    // EDITADO: A busca agora procura pelo nome OU pelo SKU e apenas entre produtos ativos.
    const query = `
      SELECT * FROM produtos 
      WHERE (nome ILIKE $1 OR sku ILIKE $1) AND status = 'ativo' 
      ORDER BY nome ASC
    `;
    const values = [`%${q}%`];

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};