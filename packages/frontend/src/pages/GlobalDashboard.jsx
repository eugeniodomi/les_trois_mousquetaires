import { useEffect, useState } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Box, Alert
} from '@mui/material';
import { AttachMoney, Timeline, TrendingUp } from '@mui/icons-material';
import { getGlobalMetrics } from '../services/globalDashboardService';

export default function GlobalDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getGlobalMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Ocorreu um erro ao carregar os dados do dashboard global.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Format monetary values beautifully in Brazilian Reais (BRL)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format((value || 0) / 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
        Dashboard Global
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Visão executiva geral de toda a companhia.
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Pipeline Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderLeft: 6, borderColor: 'primary.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  Total Sales Pipeline
                </Typography>
                <AttachMoney color="primary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatCurrency(metrics?.pipeline_total)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cotações Abertas ou Em Análise
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Win Rate Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderLeft: 6, borderColor: 'success.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  Overall Win Rate
                </Typography>
                <Timeline color="success" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatPercentage(metrics?.win_rate_percentage)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Percentual de cotações Fechadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gross Margin Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderLeft: 6, borderColor: 'warning.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  Projected Gross Margin
                </Typography>
                <TrendingUp color="warning" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatCurrency(metrics?.gross_margin)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Lucro bruto projetado (Cotações Fechadas)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Sales Reps Table */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
        Top Sales Reps
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="top sales reps table">
          <TableHead sx={{ backgroundColor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Posição</TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Representante Comercial</TableCell>
              <TableCell align="right" sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Total em Vendas (Fechadas)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics?.top_sales_reps && metrics.top_sales_reps.length > 0 ? (
              metrics.top_sales_reps.map((rep, index) => (
                <TableRow
                  key={rep.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    #{index + 1}
                  </TableCell>
                  <TableCell>{rep.nome}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(rep.total_sales)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum dado encontrado ou nenhuma cotação fechada no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
