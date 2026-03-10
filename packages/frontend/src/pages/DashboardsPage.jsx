import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import StatCard from '../components/dashboard/StatCard';
import TempoRespostaChart from '../components/dashboard/TempoRespostaChart';
import ValorMedioProdutoChart from '../components/dashboard/ValorMedioProdutoChart';

// Ícones para os StatCards
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SavingsIcon from '@mui/icons-material/Savings';

import { getDashboardStats } from '../services/dashboardService';

export default function DashboardsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await getDashboardStats();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    loadData();
  }, []);

  if (!data) {
    // Pode adicionar um CircularProgress aqui se quiser
    return <Typography>Carregando dashboards...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboards
      </Typography>

      <Grid container spacing={3}>
        {/* Linha de KPIs Rápidos */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Cotações no Mês" value={data.stats.cotacoesMes} icon={<RequestQuoteIcon sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Taxa de Resposta" value={data.stats.taxaResposta} icon={<CheckCircleOutlineIcon sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Economia Realizada" value={data.stats.economiaMes} icon={<SavingsIcon sx={{ fontSize: 40 }} />} />
        </Grid>

        {/* Linha de Gráficos */}
        <Grid item xs={12} lg={6}>
          <TempoRespostaChart data={data.tempoResposta} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ValorMedioProdutoChart data={data.valorMedio} />
        </Grid>
      </Grid>
    </Box>
  );
}