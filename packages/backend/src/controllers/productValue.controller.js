const axios = require('axios');

const pool = require('../config/database');

/*
depreceated

exports.getAllProductValues = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM valores_produtos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
}; 

*/

exports.getAllProductValues = async (req, res) => {
  try {
    // É uma boa prática fazer JOIN para trazer nomes em vez de apenas IDs
    const query = `
      SELECT 
        vp.*, 
        p.nome as produto_nome, 
        d.nome as distribuidor_nome 
      FROM valores_produtos vp
      LEFT JOIN produtos p ON vp.produto_id = p.id
      LEFT JOIN distribuidores d ON vp.distribuidor_id = d.id
      ORDER BY vp.data_cotacao DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

//UPDATE - melhorando
exports.createProductValue = async (req, res) => {
  try {
    // 1. Pegar todos os dados do corpo da requisição
    const { 
      produto_id, 
      distribuidor_id, 
      valor_cout, 
      valor_osc, 
      valor_venda_dell, 
      quantidade, 
      data_cotacao, 
      data_solicitacao, 
      data_retorno 
    } = req.body;

    // 2. Definir a query de inserção
    const insertQuery = `
      INSERT INTO valores_produtos (
        produto_id, distribuidor_id, valor_cout, valor_osc, valor_venda_dell, 
        quantidade, data_cotacao, data_solicitacao, data_retorno
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *;
    `;

    // 3. Criar o array de valores na ordem 
    const values = [
      produto_id, distribuidor_id, valor_cout, valor_osc, valor_venda_dell, 
      quantidade, data_cotacao, data_solicitacao, data_retorno
    ];

    // 4. Executar a query
    const { rows } = await pool.query(insertQuery, values);
    
    // 5. Enviar a resposta de sucesso
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error("ERRO AO CRIAR COTAÇÃO:", err.message);
    res.status(500).send('Erro no servidor ao criar cotação');
  }
};

/*



depreceated

exports.createProductValue = async (req, res) => {
  try {
    const { produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO valores_produtos (produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

*/


// Adicione aqui as outras funções de CRUD se precisar

//UPDATE - faltante
exports.getProductValueById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                vp.*, 
                p.nome as produto_nome, 
                d.nome as distribuidor_nome 
            FROM valores_produtos vp
            LEFT JOIN produtos p ON vp.produto_id = p.id
            LEFT JOIN distribuidores d ON vp.distribuidor_id = d.id
            WHERE vp.id = $1;
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

// UPDATE - ATUALIZAR COTAÇÃO (func faltante, com lógica dinâmica)
exports.updateProductValue = async (req, res) => {
    try {
        const { id } = req.params;
        const campos = req.body;
        const chaves = Object.keys(campos);

        if (chaves.length === 0) {
            return res.status(400).send({ message: "Corpo da requisição vazio." });
        }

        const setClauses = chaves.map((chave, index) => `"${chave}" = $${index + 1}`);
        const values = chaves.map(chave => campos[chave]);
        values.push(id);

        const query = `
            UPDATE valores_produtos 
            SET ${setClauses.join(', ')} 
            WHERE id = $${values.length};
        `;
        
        const { rowCount } = await pool.query(query, values);
        
        if (rowCount === 0) {
            return res.status(404).send({ message: `Cotação com id=${id} não encontrada.` });
        }
        res.send({ message: "Cotação atualizada com sucesso." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};


// DELETE - DELETAR COTAÇÃO (Função Faltante)
exports.deleteProductValue = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM valores_produtos WHERE id = $1;';
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