import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Simulação de busca detalhada no banco
const fetchCotacaoById = async (id) => {
  console.log(`Buscando detalhes da cotação com ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simula o caso de não encontrar a cotação
  if (!id.startsWith('COT-')) {
    return null;
  }

  // Retorna dados mais detalhados
  return {
    id: id,
    status: 'Finalizada',
    requester: 'Filial B',
    creationDate: new Date(2025, 7, 18),
    distributor: 'Distribuidor R',
    finalValue: 12540.75,
    paymentCondition: '30/60/90 dias',
    products: [
      { id: 'P-101', name: 'Parafuso Sextavado 1/4"', quantity: 500, unitPrice: 1.50 },
      { id: 'P-234', name: 'Chapa de Aço 2mm', quantity: 20, unitPrice: 590.00 },
      { id: 'P-509', name: 'Tubo de Cobre 1/2"', quantity: 15, unitPrice: 28.75 },
    ]
  };
};


export default function CotacaoDetailPage() {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuoteDetails = async () => {
      setLoading(true);
      const data = await fetchCotacaoById(id);
      setQuote(data);
      setLoading(false);
    };
    loadQuoteDetails();
  }, [id]); // Roda o efeito sempre que o ID da URL mudar

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!quote) {
    return <Typography variant="h5">Cotação não encontrada.</Typography>;
  }

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/cotacoes')} // Volta para a lista
        sx={{ mb: 2 }}
      >
        Voltar para a Lista
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Cotação #{quote.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Status:</strong> {quote.status}</Typography>
            <Typography><strong>Solicitante:</strong> {quote.requester}</Typography>
            <Typography><strong>Data de Criação:</strong> {quote.creationDate.toLocaleDateString('pt-BR')}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Detalhes Financeiros</Typography>
            <Typography><strong>Distribuidor:</strong> {quote.distributor}</Typography>
            <Typography><strong>Cond. Pagamento:</strong> {quote.paymentCondition}</Typography>
            <Typography><strong>Valor Final:</strong> {quote.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Itens da Cotação
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Preço Unitário</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quote.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">{product.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell align="right">{(product.quantity * product.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}