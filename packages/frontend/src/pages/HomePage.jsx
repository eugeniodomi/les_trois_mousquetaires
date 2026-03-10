import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import StatCard from '../components/dashboard/StatCard';
import QuoteList from '../components/dashboard/QuoteList';

// Ícones para os StatCards
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArticleIcon from '@mui/icons-material/Article';

import { getHomeData } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log("Current User in State:", user);
    const loadData = async () => {
      if (!user || !user.id) {
        console.error("CRITICAL: No user ID found in Context!");
        return;
      }
      try {
        const homeData = await getHomeData(user.id);
        setData(homeData);
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    };
    loadData();
  }, [user]);

  if (!data) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo(a), {user ? user.name || user.nome : 'Visitante'}
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