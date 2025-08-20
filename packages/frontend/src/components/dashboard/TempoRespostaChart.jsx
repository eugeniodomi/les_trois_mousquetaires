import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

// Apenas uma declaração da função, já com o export
export default function TempoRespostaChart({ data }) {
  return (
    <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Tempo Médio de Resposta por Distribuidora
      </Typography>
      <Box sx={{ width: '100%', flexGrow: 1 }}>
        <BarChart
          dataset={data}
          xAxis={[{ scaleType: 'band', dataKey: 'distributor' }]}
          yAxis={[{ label: 'Dias' }]}
          series={[{ dataKey: 'avgDays', label: 'Dias para responder', color: '#1976d2' }]}
          layout="vertical"
        />
      </Box>
    </Paper>
  );
}