const pool = require('../config/database');

// GET /api/dashboard/home
exports.getHomeData = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log("Received userId in Controller:", userId);
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error("CRITICAL: userId is missing from the request");
      return res.status(400).json({ error: "CRITICAL: userId is missing from the request" });
    }

    console.log('EXECUTING DB QUERY FOR USER:', userId);

    // Open quotes count
    const openQuotesResult = await pool.query(`SELECT COUNT(id) FROM cotacoes WHERE LOWER(status::text) = 'aberta' AND usuario_criador_id = $1`, [userId]);
    const openQuotes = parseInt(openQuotesResult.rows[0].count, 10);

    // Recent quotes count (last 7 days for example)
    const recentQuotesResult = await pool.query(`SELECT COUNT(id) FROM cotacoes WHERE data_criacao >= NOW() - INTERVAL '7 days' AND usuario_criador_id = $1`, [userId]);
    const recentQuotesCount = parseInt(recentQuotesResult.rows[0].count, 10);

    // Latest open quotes
    const openQuotesListResult = await pool.query(`
      SELECT c.id, c.descricao as name, c.data_criacao as date, c.status
      FROM cotacoes c
      WHERE LOWER(c.status::text) = 'aberta' AND c.usuario_criador_id = $1
      ORDER BY c.data_criacao DESC
      LIMIT 5
    `, [userId]);
    
    // Convert to the exact format needed by UI
    const openQuotesList = openQuotesListResult.rows.map(q => ({
      id: q.id,
      name: q.name,
      distributor: 'Vários', // This would need a join if we want specific distributors
      date: new Date(q.date).toLocaleDateString('pt-BR'),
      status: q.status
    }));

    // Latest quotes in general
    const recentQuotesListResult = await pool.query(`
      SELECT c.id, c.descricao as name, c.data_criacao as date, c.status
      FROM cotacoes c
      WHERE c.usuario_criador_id = $1
      ORDER BY c.data_criacao DESC
      LIMIT 5
    `, [userId]);

    const recentQuotesList = recentQuotesListResult.rows.map(q => ({
      id: q.id,
      name: q.name,
      distributor: 'Vários',
      date: new Date(q.date).toLocaleDateString('pt-BR'),
      status: q.status
    }));

    res.json({
      stats: {
        openQuotes,
        recentQuotesCount
      },
      openQuotesList,
      recentQuotesList
    });
  } catch (err) {
    console.error('Erro ao buscar dados da home:', err);
    res.status(500).json({ error: 'Erro ao buscar dados da home' });
  }
};

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Current month quotes
    const cotacoesMesResult = await pool.query(`
      SELECT COUNT(*) FROM cotacoes 
      WHERE DATE_TRUNC('month', data_criacao) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const cotacoesMes = cotacoesMesResult.rows[0].count;

    // We can mock the response rate and savings for now, or calculate if we have the formulas
    const taxaResposta = '92%';
    const economiaMes = 'R$ 15.230,00';

    // Mock tempo de resposta
    const tempoResposta = [
      { distributor: 'Distribuidor A', avgDays: 3.5 },
      { distributor: 'Fornecedor B', avgDays: 5.1 },
      { distributor: 'Distribuidor C', avgDays: 2.8 },
      { distributor: 'Parceiro D', avgDays: 4.2 },
    ];

    // Mock valor medio
    const valorMedio = [
      { month: 'Mar', avgPrice: 150.50 },
      { month: 'Abr', avgPrice: 155.20 },
      { month: 'Mai', avgPrice: 152.80 },
      { month: 'Jun', avgPrice: 160.00 },
      { month: 'Jul', avgPrice: 158.90 },
      { month: 'Ago', avgPrice: 162.30 },
    ];

    res.json({
      stats: {
        cotacoesMes: cotacoesMes.toString(),
        taxaResposta,
        economiaMes
      },
      tempoResposta,
      valorMedio
    });
  } catch (err) {
    console.error('Erro ao buscar stats do dashboard:', err);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
};
