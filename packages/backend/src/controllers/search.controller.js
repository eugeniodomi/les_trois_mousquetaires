// Supondo que você use o node-postgres (pg) e tenha um pool de conexão configurado
const pool = require('../config/database'); // <-- Seu arquivo de conexão com o banco

exports.globalSearch = async (req, res) => {
    // 1. Pega o termo de busca da query string da URL (?q=...)
    const { q } = req.query;

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'O termo de busca não pode ser vazio.' });
    }

    // Usamos '%' para o operador LIKE do SQL funcionar como "contém"
    const searchTerm = `%${q}%`;

    try {
        // 2. Aqui está a mágica: vamos fazer várias consultas em paralelo
        // Esta é uma abordagem. Outra seria uma query SQL mais complexa com UNION (veja abaixo).

        const productPromise = pool.query(
            "SELECT id, name, 'product' as type FROM products WHERE name ILIKE $1",
            [searchTerm]
        );

        const distributorPromise = pool.query(
            "SELECT id, corporate_name as name, 'distributor' as type FROM distributors WHERE corporate_name ILIKE $1",
            [searchTerm]
        );

        const itemPromise = pool.query(
            "SELECT id, description as name, 'item' as type FROM items WHERE description ILIKE $1",
            [searchTerm]
        );

        // 3. Executa todas as promises ao mesmo tempo
        const [productResults, distributorResults, itemResults] = await Promise.all([
            productPromise,
            distributorPromise,
            itemPromise,
        ]);

        // 4. Combina os resultados em um único array
        const allResults = [
            ...productResults.rows,
            ...distributorResults.rows,
            ...itemResults.rows,
        ];

        // 5. Retorna a resposta consolidada
        res.status(200).json(allResults);

    } catch (error) {
        console.error('Erro na busca global:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};