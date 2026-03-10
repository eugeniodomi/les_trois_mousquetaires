import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#9c27b0', '#0288d1', '#c0ca33', '#795548', '#607d8b'];

export default function DistributorAnalytics() {
  const [data, setData] = useState({ winRates: [], volumes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/distribuidores/analytics');
        if (!response.ok) {
          throw new Error('Falha ao buscar as métricas de distribuidores.');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>Erro: {error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Análise Operacional de Distribuidores
      </Typography>
      
      <Grid container spacing={3}>
        {/* Competitividade do Distribuidor (Win Rate) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 5: Competitividade (Cotações Concluídas/Ganhas)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ranking por maior número de participações vitoriosas.
            </Typography>
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.winRates}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quotes_won"
                    nameKey="distributor_name"
                  >
                    {data.winRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [value, 'Cotações Ganhas']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Volume de Negócios (R$) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 5: Volume de Negócios (R$)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Baseado na soma dos valores de venda de todos os itens em cotações.
            </Typography>
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.volumes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="distributor_name" />
                  <YAxis tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} />
                  <RechartsTooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Volume (R$)']}
                  />
                  <Legend />
                  <Bar dataKey="total_volume" name="Volume Total (R$)" fill="#f57c00" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
