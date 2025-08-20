// src/pages/CotacaoDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- API SIMULADA ATUALIZADA ---
// Adicionando o campo 'inseridoPor'
const fetchCotacaoById = async (id) => {
  console.log(`Buscando detalhes da cotação com ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!id.startsWith('COT-')) {
    return null;
  }
  
  const finalValue = 12540.75;
  return {
    id: id,
    status: 'Finalizada',
    requester: 'Filial B',
    distributor: 'Distribuidor R',
    finalValue: finalValue,
    paymentCondition: '30/60/90 dias',
    dataCotacao: new Date(2025, 7, 19),
    dataSolicitacao: new Date(2025, 7, 15),
    dataRetorno: new Date(2025, 7, 18),
    dataRegistro: new Date(),
    valorOsc: parseFloat((finalValue * 0.98).toFixed(2)),
    valorVenda: parseFloat((finalValue * 1.05).toFixed(2)),
    // ADICIONADO: Novo campo
    inseridoPor: 'Eugênio', // Exemplo de nome do usuário
    products: [
      { id: 'P-101', name: 'Parafuso Sextavado 1/4"', quantity: 500, unitPrice: 1.50 },
      { id: 'P-234', name: 'Chapa de Aço 2mm', quantity: 20, unitPrice: 590.00 },
      { id: 'P-509', name: 'Tubo de Cobre 1/2"', quantity: 15, unitPrice: 28.75 },
    ]
  };
};

const formatCurrency = (value) => {
    if (value == null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function CotacaoDetailPage() {
  const { id } = useParams();
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
  }, [id]);

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
        onClick={() => navigate('/cotacoes')}
        sx={{ mb: 2 }}
      >
        Voltar para a Lista
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Cotação #{quote.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          {/* Coluna 1: Informações Gerais */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Status:</strong> {quote.status}</Typography>
            <Typography><strong>Solicitante:</strong> {quote.requester}</Typography>
            {/* ADICIONADO: Novo campo de usuário */}
            <Typography><strong>Inserido por:</strong> {quote.inseridoPor}</Typography>
          </Grid>
          
          {/* Coluna 2: Detalhes Financeiros */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Detalhes Financeiros</Typography>
            <Typography><strong>Distribuidor:</strong> {quote.distributor}</Typography>
            <Typography><strong>Cond. Pagamento:</strong> {quote.paymentCondition}</Typography>
            <Typography><strong>Valor OSC:</strong> {formatCurrency(quote.valorOsc)}</Typography>
            <Typography><strong>Valor Venda:</strong> {formatCurrency(quote.valorVenda)}</Typography>
            <Typography><strong>Valor Final:</strong> {formatCurrency(quote.finalValue)}</Typography>
          </Grid>

          {/* Coluna 3: Datas */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Datas Relevantes</Typography>
            <Typography><strong>Data de Solicitação:</strong> {new Date(quote.dataSolicitacao).toLocaleDateString('pt-BR')}</Typography>
            <Typography><strong>Data de Retorno:</strong> {new Date(quote.dataRetorno).toLocaleDateString('pt-BR')}</Typography>
            <Typography><strong>Data da Cotação:</strong> {new Date(quote.dataCotacao).toLocaleDateString('pt-BR')}</Typography>
            <Typography><strong>Data de Registro:</strong> {new Date(quote.dataRegistro).toLocaleString('pt-BR')}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ... (Tabela de Itens da Cotação - sem alterações) ... */}
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
                  <TableCell align="right">{formatCurrency(product.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(product.quantity * product.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}