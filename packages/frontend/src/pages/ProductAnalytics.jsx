import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ProductAnalytics() {
  const [data, setData] = useState({ topQuoted: [], topRevenue: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/produtos/analytics');
        if (!response.ok) {
          throw new Error('Falha ao buscar as métricas de produtos.');
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
        Análise Operacional de Produtos
      </Typography>
      
      <Grid container spacing={3}>
        {/* Top 5 Produtos mais Cotados */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 5: Produtos Mais Cotados
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Baseado na quantidade de vezes em que o produto apareceu nas cotações.
            </Typography>
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topQuoted} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="quote_count" name="Vezes Cotado" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top 5 Produtos por Faturamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 5: Produtos por Faturamento (R$)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Baseado na soma do valor de venda final nas cotações.
            </Typography>
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" />
                  <YAxis tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} />
                  <RechartsTooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita Total']}
                  />
                  <Legend />
                  <Bar dataKey="total_revenue" name="Receita (R$)" fill="#388e3c" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
