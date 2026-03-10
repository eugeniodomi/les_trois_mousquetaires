import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';
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
          <Card elevation={3} sx={{ height: '100%', minHeight: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
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
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      dataKey="quotes_won"
                      nameKey="distributor_name"
                      animationDuration={1500}
                    >
                      {data.winRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [value, 'Cotações Ganhas']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Volume de Negócios (R$) */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', minHeight: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 5: Volume de Negócios (R$)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Baseado na soma dos valores de venda de todos os itens em cotações.
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.volumes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#ed6c02" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="distributor_name" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR')}`} tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Volume (R$)']}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 15px rgba(0,0,0,0.1)', border: 'none' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="total_volume" name="Volume Total" fill="url(#colorVolume)" radius={[8, 8, 0, 0]} animationDuration={1500} />
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
