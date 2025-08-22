const pool = require('../config/database');

exports.globalSearch = async (req, res) => {
    // 1. Pega o termo de busca da query string da URL (?q=...)
    const { q } = req.query;

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'O termo de busca não pode ser vazio.' });
    }

    const searchTerm = `%${q}%`;

    try {
        // 2. Consultas em paralelo, agora adaptadas para a nova estrutura do banco de dados

        // ALTERADO: Busca em 'produtos', usando 'nome' e 'sku', e filtrando por status 'ativo'.
        const productPromise = pool.query(
            `SELECT 
                id, 
                nome as titulo, 
                sku as subtitulo, 
                'produto' as tipo 
             FROM produtos 
             WHERE (nome ILIKE $1 OR sku ILIKE $1) AND status = 'ativo'`,
            [searchTerm]
        );

        // ALTERADO: Busca em 'distribuidores', usando 'nome' e filtrando por status 'ativo'.
        const distributorPromise = pool.query(
            `SELECT 
                id, 
                nome as titulo, 
                cnpj as subtitulo, 
                'distribuidor' as tipo 
             FROM distribuidores 
             WHERE nome ILIKE $1 AND status = 'ativo'`,
            [searchTerm]
        );

        // NOVO: Adicionada a busca na tabela 'categorias'.
        const categoryPromise = pool.query(
            `SELECT 
                id, 
                nome as titulo, 
                'Categoria de produto' as subtitulo, 
                'categoria' as tipo 
             FROM categorias 
             WHERE nome ILIKE $1`,
            [searchTerm]
        );

        // REMOVIDO: A busca na tabela 'items' foi removida pois ela não existe mais no novo schema.

        // 3. Executa todas as promises ao mesmo tempo
        const [productResults, distributorResults, categoryResults] = await Promise.all([
            productPromise,
            distributorPromise,
            categoryPromise,
        ]);

        // 4. Combina os resultados em um único array
        const allResults = [
            ...productResults.rows,
            ...distributorResults.rows,
            ...categoryResults.rows,
        ];

        // 5. Retorna a resposta consolidada
        res.status(200).json(allResults);

    } catch (error) {
        console.error('Erro na busca global:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};