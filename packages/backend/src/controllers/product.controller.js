const pool = require('../config/database');

// Lógica para buscar todos os produtos ATIVOS (Nenhuma alteração necessária)
exports.findAll = async (req, res) => {
  try {
    const query = "SELECT * FROM produtos WHERE status = 'ativo' ORDER BY nome ASC";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// --- CÓDIGO CORRIGIDO ---
// Lógica para criar um novo produto, alinhada com o formulário e o banco de dados
exports.create = async (req, res) => {
  try {
    // 1. Captura apenas os campos que o formulário realmente envia
    const { nome, descricao, sku, categoria_id } = req.body;
    const status = 'ativo'; // Define um status padrão no backend

    // 2. Validação atualizada: verifica apenas o 'nome'
    if (!nome || !nome.trim()) {
      return res.status(400).send({ message: "O campo 'nome' é obrigatório." });
    }

    // 3. Query de inserção corrigida: sem 'unidade_medida' e sem colunas de data
    const query = `
      INSERT INTO produtos (nome, descricao, sku, categoria_id, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    // 4. Array de valores correspondente à nova query
    const values = [nome, descricao, sku, categoria_id, status];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// --- CÓDIGO CORRIGIDO ---
// Lógica para atualizar um produto
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

    // A linha que atualizava 'data_atualizacao' foi REMOVIDA
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

// --- CÓDIGO CORRIGIDO ---
// Lógica para "deletar" um produto (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Query corrigida: atualiza apenas o status, sem 'data_atualizacao'
    const query = `
      UPDATE produtos
      SET status = 'inativo'
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 1) {
      res.json({ message: 'Produto desativado com sucesso!' });
    } else {
      res.status(404).send({ message: `Produto com id=${id} não foi encontrado.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para buscar produtos por nome ou SKU (Nenhuma alteração necessária)
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

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

// Lógica para buscar um produto por ID, incluindo o nome da categoria
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.*, c.nome AS nome_categoria
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send({ message: `Produto com id=${id} não encontrado.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};