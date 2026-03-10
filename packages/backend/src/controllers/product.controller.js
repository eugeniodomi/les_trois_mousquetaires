const pool = require('../config/database');

// Otimizado: Busca todos os produtos, já incluindo o nome da categoria.
exports.findAll = async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.nome AS nome_categoria
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.status = 'ativo' 
      ORDER BY p.nome ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Mantido: Busca um produto por ID, incluindo o nome da categoria.
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

// Corrigido: Cria um produto com os campos corretos da tabela.
exports.create = async (req, res) => {
  try {
    // A coluna 'unidade_medida' existe no BD, mas é opcional no formulário.
    // Se ela vier do frontend, será inserida; senão, será NULL (se o BD permitir).
    const { nome, descricao, sku, categoria_id, unidade_medida } = req.body;
    const status = 'ativo';

    if (!nome || !nome.trim()) {
      return res.status(400).send({ message: "O campo 'nome' é obrigatório." });
    }

    const query = `
      INSERT INTO produtos (nome, descricao, sku, categoria_id, status, unidade_medida)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [nome, descricao, sku, categoria_id, status, unidade_medida];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// --- CORREÇÃO PRINCIPAL ---
// Atualiza um produto, ignorando campos virtuais que não existem na tabela.
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);

    if (chaves.length === 0) {
      return res.status(400).send({ message: "Corpo da requisição não pode ser vazio." });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const chave of chaves) {
      // ✅ A SOLUÇÃO: Ignora campos que não pertencem à tabela 'produtos'.
      if (chave !== 'id' && chave !== 'nome_categoria') {
        setClauses.push(`${chave} = $${paramIndex}`);
        values.push(campos[chave]);
        paramIndex++;
      }
    }
    
    if (setClauses.length === 0) {
        return res.status(400).send({ message: "Nenhum campo válido para atualização foi fornecido." });
    }

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
      res.status(404).send({ message: `Produto com id=${id} não encontrado.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Mantido: Realiza o "soft delete" do produto.
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `UPDATE produtos SET status = 'inativo' WHERE id = $1`;
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

// Otimizado: Busca produtos, já incluindo o nome da categoria.
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const query = `
      SELECT p.*, c.nome as nome_categoria 
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE (p.nome ILIKE $1 OR p.sku ILIKE $1) AND p.status = 'ativo'
      ORDER BY p.nome ASC
    `;
    const values = [`%${q}%`];

    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Busca o histórico de preços do produto
exports.getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Consulta para buscar as cotações onde este produto aparece
    const query = `
      SELECT 
        dc.valor_unitario AS price,
        c.data_criacao AS date,
        d.nome AS "distributorName",
        c.id AS cotacao_id
      FROM dados_cotacoes dc
      JOIN cotacoes c ON dc.cotacao_id = c.id
      JOIN distribuidores d ON dc.distribuidor_id = d.id
      WHERE dc.produto_id = $1
      ORDER BY c.data_criacao ASC
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    // Formatar os dados se necessário (ex: converter numeric para float)
    const formattedRows = rows.map(r => ({
      ...r,
      price: parseFloat(r.price)
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error("Erro ao buscar histórico de preços:", err.message);
    res.status(500).send('Erro no servidor ao buscar histórico de preços');
  }
};

// Buscar analytics para o dashboard de produtos
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Top 5 Produtos mais Cotados (por quantidade de vezes que aparecem em cotações)
    const topQuotedQuery = `
      SELECT 
        p.nome as product_name,
        COUNT(dc.id) as quote_count
      FROM produtos p
      LEFT JOIN dados_cotacoes dc ON p.id = dc.produto_id
      GROUP BY p.id, p.nome
      ORDER BY quote_count DESC
      LIMIT 5
    `;
    const topQuotedResult = await pool.query(topQuotedQuery);

    // 2. Top 5 Produtos gerando mais receita
    const topRevenueQuery = `
      SELECT 
        p.nome as product_name,
        COALESCE(SUM(dc.valor_venda_final * dc.quantidade), 0) as total_revenue
      FROM produtos p
      LEFT JOIN dados_cotacoes dc ON p.id = dc.produto_id
      GROUP BY p.id, p.nome
      ORDER BY total_revenue DESC
      LIMIT 5
    `;
    const topRevenueResult = await pool.query(topRevenueQuery);

    res.json({
      topQuoted: topQuotedResult.rows,
      topRevenue: topRevenueResult.rows
    });
  } catch (err) {
    console.error("Erro ao buscar analytics de produtos:", err.message);
    res.status(500).send('Erro no servidor ao buscar analytics');
  }
};
