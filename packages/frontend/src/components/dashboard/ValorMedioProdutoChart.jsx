import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

// ===== CORREÇÃO AQUI =====
export default function ValorMedioProdutoChart({ data }) {
  return (
    <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Valor Médio do "Produto X" (Últimos 6 Meses)
      </Typography>
      <Box sx={{ width: '100%', flexGrow: 1 }}>
        <LineChart
          dataset={data}
          xAxis={[{ scaleType: 'point', dataKey: 'month' }]}
          yAxis={[{ label: 'Valor Médio (R$)' }]}
          series={[{ dataKey: 'avgPrice', label: 'Preço Médio', color: '#dc004e', area: true }]}
        />
      </Box>
    </Paper>
  );
}