//CRUD DOS DISTRIBUIDORES

/* distributor.controller.js em caso de ORM 

const db = require('../models'); // uso de Sequelize ou uma configuração similar
const Distributor = db.distribuidores; // Acessando o model/tabela

*/

//importando pool do database.js /config
const pool = require('../config/database.js'); 




// Função para CRIAR um novo distribuidor
exports.create = async (req, res) => {
    try {
        // Validação básica dos dados recebidos
        if (!req.body.nome) {
            return res.status(400).send({ message: "O nome do distribuidor não pode ser vazio!" });
        }

        // Usando pool.query com SQL para inserir dados
        const { nome, cnpj, contato_nome, contato_email, telefone } = req.body;
        const query = `
            INSERT INTO distribuidores (nome, cnpj, contato_nome, contato_email, telefone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [nome, cnpj, contato_nome, contato_email, telefone];
        
        const result = await pool.query(query, values);
        res.status(201).send(result.rows[0]);

    } catch (error) {
        res.status(500).send({ message: error.message || "Ocorreu um erro ao criar o distribuidor." });
    }
};

// Função para LISTAR TODOS os distribuidores
exports.findAll = async (req, res) => {
    try {
        //Usando pool.query com SQL para selecionar todos
        const query = 'SELECT * FROM distribuidores ORDER BY nome ASC';
        const result = await pool.query(query);
        res.send(result.rows);

    } catch (error) {
        res.status(500).send({ message: error.message || "Ocorreu um erro ao buscar os distribuidores." });
    }
};

// Função para BUSCAR UM distribuidor pelo ID
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Usando pool.query com SQL para selecionar por ID
        const query = 'SELECT * FROM distribuidores WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            res.send(result.rows[0]);
        } else {
            res.status(404).send({ message: `Não foi possível encontrar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar o distribuidor com id=" + req.params.id });
    }
};

// Função para ATUALIZAR um distribuidor

// Função para ATUALIZAR um distribuidor (VERSÃO CORRIGIDA E MELHORADA)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const campos = req.body; // Pega todos os campos enviados
        const chaves = Object.keys(campos); // Pega as chaves (ex: ['contato_nome', 'telefone'])

        // Se nenhum campo for enviado, retorna um erro.
        if (chaves.length === 0) {
            return res.status(400).send({ message: "O corpo da requisição não pode ser vazio para atualização." });
        }

        // Inicia os arrays para montar a query dinamicamente
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        // Monta a parte SET da query (ex: "nome" = $1, "cnpj" = $2)
        for (const chave of chaves) {
            setClauses.push(`"${chave}" = $${paramIndex}`);
            values.push(campos[chave]);
            paramIndex++;
        }

        // Adiciona o id ao final do array de valores para a cláusula WHERE
        values.push(id);

        // Constrói a query final
        const query = `
            UPDATE distribuidores 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex};
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rowCount === 1) {
            res.send({ message: "Distribuidor atualizado com sucesso." });
        } else {
            res.status(404).send({ message: `Não foi possível encontrar e atualizar o distribuidor com id=${id}.` });
        }
    } catch (error) {
        console.error("ERRO DETALHADO AO ATUALIZAR:", error);
        res.status(500).send({ message: "Erro ao atualizar o distribuidor com id=" + req.params.id });
    }
};



/* old version depreceated

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, cnpj, contato_nome, contato_email, telefone } = req.body;

        //Usando pool.query com SQL para atualizar
        const query = `
            UPDATE distribuidores 
            SET nome = $1, cnpj = $2, contato_nome = $3, contato_email = $4, telefone = $5
            WHERE id = $6;
        `;
        const values = [nome, cnpj, contato_nome, contato_email, telefone, id];
        
        const result = await pool.query(query, values);
        
        // O result.rowCount informa quantas linhas foram afetadas
        if (result.rowCount === 1) {
            res.send({ message: "Distribuidor atualizado com sucesso." });
        } else {
            res.send({ message: `Não foi possível atualizar o distribuidor com id=${id}. Talvez não foi encontrado ou o corpo da requisição está vazio.` });
        }
    } catch (error) {
        //debug
        console.error("ERRO DETALHADO:", error); 

        res.status(500).send({ message: "Erro ao atualizar o distribuidor com id=" + req.params.id });
    }
};

*/

// Função para DELETAR um distribuidor
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        // Usando pool.query com SQL para deletar
        const query = 'DELETE FROM distribuidores WHERE id = $1;';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 1) {
            res.send({ message: "Distribuidor deletado com sucesso!" });
        } else {
            res.send({ message: `Não foi possível deletar o distribuidor com id=${id}. Talvez não tenha sido encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Não foi possível deletar o distribuidor com id=" + req.params.id });
    }
};