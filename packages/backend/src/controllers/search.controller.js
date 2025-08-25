const pool = require('../config/database');

/**
 * Configuração das entidades para a busca global.
 * O filtro de status foi removido para incluir todos os registros.
 */
const searchConfig = [
    {
        type: 'produto',
        table: 'produtos',
        titleField: 'nome',
        subtitleField: 'sku',
        searchFields: ['nome', 'sku'],
        filter: null // Busca em todos os produtos, independentemente do status.
    },
    {
        type: 'distribuidor',
        table: 'distribuidores',
        titleField: 'nome',
        subtitleField: 'cnpj',
        searchFields: ['nome', 'cnpj'],
        filter: null // Busca em todos os distribuidores, independentemente do status.
    },
    {
        type: 'usuario',
        table: 'usuarios',
        titleField: 'nome',
        subtitleField: 'email',
        searchFields: ['nome', 'email'],
        filter: null // Busca em todos os usuários, independentemente do status.
    },
    {
        type: 'categoria',
        table: 'categorias',
        titleField: 'nome',
        subtitleField: "'Categoria de produto'",
        searchFields: ['nome'],
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

    } catch (error) { // CORREÇÃO: Adicionadas as chaves {} ao redor do bloco catch.
        console.error('Erro na busca global:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};