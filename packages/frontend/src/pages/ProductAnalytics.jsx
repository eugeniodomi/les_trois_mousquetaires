import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';
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
          <Card elevation={3} sx={{ height: '100%', minHeight: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 5: Produtos Mais Cotados
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Baseado na quantidade de vezes em que o produto apareceu nas cotações.
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topQuoted} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="product_name" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="quote_count" name="Vezes Cotado" fill="url(#colorQuoted)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 Produtos por Faturamento */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', minHeight: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 5: Produtos por Faturamento (R$)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Baseado na soma do valor de venda final nas cotações.
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="product_name" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita Total']}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="total_revenue" name="Receita Total" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
