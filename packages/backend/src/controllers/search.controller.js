// search.controller.js
const pool = require('../config/database');

/**
 * Configuração das entidades para a busca global.
 */
const searchConfig = [
    {
        type: 'produto',
        table: 'produtos',
        titleField: 'nome',
        subtitleField: 'sku',
        searchFields: ['nome', 'sku'],
        filter: null 
    },
    {
        type: 'distribuidor',
        table: 'distribuidores',
        titleField: 'nome',
        subtitleField: 'cnpj',
        searchFields: ['nome', 'cnpj'],
        filter: null
    },
    {
        type: 'usuario',
        table: 'usuarios',
        titleField: 'nome',
        subtitleField: 'email',
        searchFields: ['nome', 'email'],
        filter: null
    },
    {
        type: 'categoria',
        table: 'categorias',
        titleField: 'nome',
        subtitleField: "'Categoria de produto'",
        searchFields: ['nome'],
        filter: null
    },
    // CONFIGURAÇÃO DE COTAÇÃO COM BUSCA PELA DESCRIÇÃO
    {
        type: 'cotacao',
        table: 'cotacoes',
        titleField: 'descricao',
        subtitleField: "CONCAT('Status: ', status, ' - ID: ', id)",
        searchFields: ['descricao', 'status::TEXT'], // <--- É AQUI QUE A MÁGICA ACONTECE
        filter: null
    }
];

exports.globalSearch = async (req, res) => {
    const { q, limit = 5 } = req.query; 

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'O termo de busca não pode ser vazio.' });
    }

    const searchTerm = `%${q}%`;

    try {
        const searchPromises = searchConfig.map(config => {
            const whereClauses = config.searchFields
                .map(field => `${field} ILIKE $1`)
                .join(' OR ');

            const query = `
                SELECT 
                    id, 
                    ${config.titleField} AS titulo, 
                    ${config.subtitleField} AS subtitulo, 
                    '${config.type}' AS tipo 
                FROM ${config.table}
                WHERE (${whereClauses})
                ${config.filter ? `AND ${config.filter}` : ''}
                ORDER BY ${config.titleField} ASC
                LIMIT $2
            `;
            
            return pool.query(query, [searchTerm, limit]);
        });

        const results = await Promise.all(searchPromises);
        const allResults = results.flatMap(result => result.rows);

        res.status(200).json(allResults);

    } catch (error) {
        console.error('Erro na busca global:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};