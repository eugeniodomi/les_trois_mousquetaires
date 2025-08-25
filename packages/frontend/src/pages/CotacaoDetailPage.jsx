// src/pages/CotacaoDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Importe a função real do seu serviço
import { getQuotationById } from '../services/quotationService';

// Função auxiliar para formatar moeda
const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função auxiliar para formatar datas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export default function CotacaoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // LÓGICA DE BUSCA REAL (do nosso código anterior)
  useEffect(() => {
    const loadQuoteDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getQuotationById(id);
        setQuote(data);
      } catch (err) {
        setError(err.message || 'Ocorreu um erro ao buscar a cotação.');
      } finally {
        setLoading(false);
      }
    };
    loadQuoteDetails();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography variant="h5" color="error">Erro: {error}</Typography>;
  }

  if (!quote) {
    return <Typography variant="h5">Cotação não encontrada.</Typography>;
  }

  // CRIAÇÃO DA LISTA SINTÉTICA DE ITENS
  // Usamos os dados do único produto retornado pela API para montar a tabela
  const productsList = [
    {
      id: quote.produto_id,
      name: quote.produto_nome || 'Produto não especificado',
      quantity: quote.quantidade,
      // O backend não retorna preço unitário, então calculamos a partir do valor final e quantidade
      unitPrice: quote.quantidade ? quote.valor_venda_final / quote.quantidade : 0,
    }
  ];

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/cotacoes')} // Usando navigate para voltar
        sx={{ mb: 2 }}
      >
        Voltar para a Lista
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Cotação #{quote.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {/* MAPEAMENTO DOS DADOS: Usamos os campos do 'quote' (da API) para preencher o layout */}
        <Grid container spacing={3}>
          {/* Coluna 1: Informações Gerais */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Informações Gerais</Typography>
            {/* Campos como 'status' e 'solicitante' não vêm do backend atual, então ficarão como N/A */}
            <Typography><strong>Status:</strong> {quote.status || 'N/A'}</Typography>
            <Typography><strong>Solicitante:</strong> N/A</Typography>
            <Typography><strong>Inserido por:</strong> {quote.usuario_nome}</Typography>
          </Grid>
          
          {/* Coluna 2: Detalhes Financeiros */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Detalhes Financeiros</Typography>
            <Typography><strong>Distribuidor:</strong> {quote.distribuidor_nome}</Typography>
            <Typography><strong>Cond. Pagamento:</strong> N/A</Typography>
            <Typography><strong>Valor OSC:</strong> {formatCurrency(quote.valor_osc)}</Typography>
            <Typography><strong>Valor Venda:</strong> {formatCurrency(quote.valor_venda_final)}</Typography>
            <Typography><strong>Valor Cout:</strong> {formatCurrency(quote.valor_cout)}</Typography>
          </Grid>

          {/* Coluna 3: Datas */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Datas Relevantes</Typography>
            <Typography><strong>Data de Solicitação:</strong> {formatDate(quote.data_solicitacao)}</Typography>
            <Typography><strong>Data de Retorno:</strong> {formatDate(quote.data_retorno)}</Typography>
            <Typography><strong>Data da Cotação:</strong> {formatDate(quote.data_cotacao)}</Typography>
            <Typography><strong>Data de Registro:</strong> {new Date(quote.data_registro).toLocaleString('pt-BR')}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Tabela de Itens da Cotação */}
        <Typography variant="h5" gutterBottom>
          Itens da Cotação
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Preço Unitário (Estimado)</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsList.map((product) => (
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