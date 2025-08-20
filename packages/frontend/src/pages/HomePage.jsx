import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import StatCard from '../components/dashboard/StatCard';
import QuoteList from '../components/dashboard/QuoteList';

// Ícones para os StatCards
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArticleIcon from '@mui/icons-material/Article';

// --- SIMULAÇÃO DE DADOS DO BACKEND ---
const fetchHomePageData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    stats: {
      openQuotes: 8,
      recentQuotesCount: 5,
    },
    openQuotesList: [
      { id: 'COT-202545', name: 'Cotação de Rolamentos', distributor: 'Distribuidor A', date: '20/08/2025', status: 'Aberta' },
      { id: 'COT-202542', name: 'Orçamento de Tintas', distributor: 'Fornecedor B', date: '18/08/2025', status: 'Aberta' },
      // ... mais cotações abertas
    ],
    recentQuotesList: [
      { id: 'COT-202548', name: 'Pedido de Compra #123', distributor: 'Distribuidor C', date: 'Hoje' },
      { id: 'COT-202547', name: 'Verificação de Preço - SKU 554', distributor: 'Parceiro D', date: 'Ontem' },
      // ... mais cotações recentes
    ],
  };
};

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const homeData = await fetchHomePageData();
      setData(homeData);
    };
    loadData();
  }, []);

  if (!data) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Página Inicial
      </Typography>
      
      {/* Barra de Pesquisa */}
      <GlobalSearchBar />

      <Grid container spacing={3}>
        {/* Cards de KPIs */}
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Cotações em Aberto" 
            value={data.stats.openQuotes} 
            icon={<HourglassTopIcon sx={{ fontSize: 40 }} />} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Adicionadas Recentemente" 
            value={data.stats.recentQuotesCount} 
            icon={<ArticleIcon sx={{ fontSize: 40 }} />} 
          />
        </Grid>
        
        {/* Coluna Principal com Itens de Prioridade */}
        <Grid item xs={12} md={8}>
          <QuoteList 
            title="Cotações Abertas (Prioridade)" 
            quotes={data.openQuotesList} 
          />
        </Grid>
        
        {/* Coluna Lateral com Itens Recentes */}
        <Grid item xs={12} md={4}>
          <QuoteList 
            title="Adicionadas Recentemente" 
            quotes={data.recentQuotesList} 
          />
        </Grid>
      </Grid>
    </Box>
  );
}