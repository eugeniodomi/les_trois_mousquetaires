const pool = require('../config/database');

exports.getGlobalMetrics = async (req, res) => {
    try {
        const client = await pool.connect();

        try {
            // 1. Total Quotes and Win Rate
            const quotesQuery = `
                SELECT 
                    COUNT(id) AS total_quotes,
                    SUM(CASE WHEN LOWER(status::text) = 'fechada' THEN 1 ELSE 0 END) AS won_quotes
                FROM cotacoes
            `;
            const quotesResult = await client.query(quotesQuery);
            const totalQuotes = parseInt(quotesResult.rows[0].total_quotes, 10) || 0;
            const wonQuotes = parseInt(quotesResult.rows[0].won_quotes, 10) || 0;
            
            // Math Safety: Handle division by zero gracefully
            const winRate = totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0;

            // 2. Total Sales Pipeline & Projected Gross Margin
            // Pipeline: SUM(valor_venda_final * quantidade) for 'Aberta' or 'Em Análise'
            // Margin: SUM((valor_venda_final - COALESCE(valor_unitario, 0)) * quantidade) for 'Fechada'
            const financialQuery = `
                SELECT 
                    COALESCE(SUM(CASE WHEN LOWER(c.status::text) IN ('aberta', 'em análise', 'em analise') THEN dc.valor_venda_final * dc.quantidade ELSE 0 END), 0) AS pipeline_total,
                    COALESCE(SUM(CASE WHEN LOWER(c.status::text) = 'fechada' THEN (dc.valor_venda_final - COALESCE(dc.valor_unitario, 0)) * dc.quantidade ELSE 0 END), 0) AS gross_margin
                FROM cotacoes c
                JOIN dados_cotacoes dc ON c.id = dc.cotacao_id
            `;
            const financialResult = await client.query(financialQuery);
            
            // Null Handling: Use JS fallbacks as an extra layer of safety after COALESCE
            const pipelineTotal = parseFloat(financialResult.rows[0].pipeline_total) || 0;
            const grossMargin = parseFloat(financialResult.rows[0].gross_margin) || 0;

            // 3. Top Sales Reps
            const topRepsQuery = `
                SELECT 
                    u.id, 
                    u.nome, 
                    COALESCE(SUM(dc.valor_venda_final * dc.quantidade), 0) as total_sales
                FROM cotacoes c
                JOIN usuarios u ON c.usuario_criador_id = u.id
                JOIN dados_cotacoes dc ON c.id = dc.cotacao_id
                WHERE LOWER(c.status::text) = 'fechada'
                GROUP BY u.id, u.nome
                ORDER BY total_sales DESC
                LIMIT 3
            `;
            const topRepsResult = await client.query(topRepsQuery);

            // 4. Distributor Response Time (SLA)
            const slaQuery = `
                SELECT 
                    d.nome as distribuidor,
                    COALESCE(AVG(CASE WHEN c.data_criacao >= CURRENT_DATE - INTERVAL '21 days' THEN EXTRACT(EPOCH FROM (dc.data_retorno - c.data_criacao))/3600 ELSE NULL END), 0) as avg_hours_3_weeks,
                    COALESCE(AVG(CASE WHEN c.data_criacao >= CURRENT_DATE - INTERVAL '30 days' THEN EXTRACT(EPOCH FROM (dc.data_retorno - c.data_criacao))/3600 ELSE NULL END), 0) as avg_hours_1_month,
                    COALESCE(AVG(EXTRACT(EPOCH FROM (dc.data_retorno - c.data_criacao))/3600), 0) as avg_hours_all_time
                FROM dados_cotacoes dc
                JOIN cotacoes c ON dc.cotacao_id = c.id
                JOIN distribuidores d ON dc.distribuidor_id = d.id
                WHERE dc.data_retorno IS NOT NULL
                GROUP BY d.nome
                ORDER BY avg_hours_all_time ASC
                LIMIT 5
            `;
            const slaResult = await client.query(slaQuery);

            // 5. Pricing Benchmark by Distributor
            const pricingQuery = `
                SELECT 
                    d.nome as distribuidor,
                    AVG(dc.valor_unitario) as avg_price,
                    COUNT(dc.id) as total_items_quoted
                FROM dados_cotacoes dc
                JOIN distribuidores d ON dc.distribuidor_id = d.id
                WHERE dc.valor_unitario IS NOT NULL
                GROUP BY d.nome
                ORDER BY avg_price ASC
                LIMIT 5
            `;
            const pricingResult = await client.query(pricingQuery);

            res.status(200).json({
                pipeline_total: pipelineTotal,
                win_rate_percentage: winRate,
                gross_margin: grossMargin,
                top_sales_reps: topRepsResult.rows.map(row => ({
                    id: row.id,
                    nome: row.nome,
                    total_sales: parseFloat(row.total_sales) || 0
                })),
                sla_distribuidores: slaResult.rows.map(row => ({
                    distribuidor: row.distribuidor,
                    avg_hours_3_weeks: parseFloat(row.avg_hours_3_weeks) || 0,
                    avg_hours_1_month: parseFloat(row.avg_hours_1_month) || 0,
                    avg_hours_all_time: parseFloat(row.avg_hours_all_time) || 0
                })),
                pricing_benchmark: pricingResult.rows.map(row => ({
                    distribuidor: row.distribuidor,
                    avg_price: parseFloat(row.avg_price) || 0,
                    total_items_quoted: parseInt(row.total_items_quoted, 10) || 0
                }))
            });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("ERRO AO BUSCAR DADOS DO DASHBOARD GLOBAL:", error);
        res.status(500).json({ message: "Erro interno no servidor ao buscar dados do dashboard global." });
    }
};
