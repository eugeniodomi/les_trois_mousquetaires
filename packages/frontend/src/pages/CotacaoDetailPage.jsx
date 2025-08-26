// src/pages/CotacaoDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// A função de serviço permanece a mesma, buscando da API correta.
import { getQuotationById } from '../services/quotationService'; 

// Função auxiliar para formatar moeda
const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função auxiliar para formatar datas (ex: 25/12/2024)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Adiciona 'T00:00:00' para garantir que a data seja interpretada em fuso horário local
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
};

// Função auxiliar para formatar data e hora (ex: 25/12/2024 14:30:00)
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
};

export default function CotacaoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuoteDetails = async () => {
      if (id === 'nova') {
        setLoading(false);
        setError("Esta é uma página para visualização. Para criar, vá para a página de cadastro.");
        return;
      }

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

  // --- Funções de cálculo para os totais ---
  const calculateTotal = (field) => {
    if (!quote || !quote.itens) return 0;
    return quote.itens.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
  };
  
  const calculateTotalVenda = () => {
    if (!quote || !quote.itens) return 0;
    return quote.itens.reduce((sum, item) => sum + ( (item.quantidade || 0) * (item.valor_unitario || 0) ), 0);
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
        <Box sx={{textAlign: 'center', mt: 4}}>
            <Typography variant="h5" color="error">Erro: {error}</Typography>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/cotacoes')}
                sx={{ mt: 2 }}
            >
                Voltar para a Lista
            </Button>
        </Box>
    );
  }

  if (!quote) {
    return <Typography variant="h5">Cotação não encontrada.</Typography>;
  }

  return (
  <> {/* PASSO 1: Adicione esta tag de abertura do fragmento */}

      {/* PASSO 2: Adicione o título de diagnóstico aqui */}
      <h1 style={{ color: 'red', textAlign: 'center' }}>
        EU SOU A PÁGINA DE DETALHES
      </h1>

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
        <Typography variant="subtitle1" color="text.secondary">
          {quote.descricao}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {/* LAYOUT RESTAURADO PARA O FORMATO ORIGINAL DE 3 COLUNAS */}
        <Grid container spacing={3}>
          {/* Coluna 1: Informações Gerais */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Status:</strong> {quote.status || 'N/A'}</Typography>
            <Typography><strong>Solicitante:</strong> N/A</Typography>
            <Typography><strong>Inserido por (ID):</strong> {quote.usuario_criador_id || 'N/A'}</Typography>
          </Grid>
          
          {/* Coluna 2: Detalhes Financeiros (com totais calculados) */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Totais Financeiros</Typography>
            <Typography><strong>Distribuidor(es):</strong> Múltiplos (ver tabela)</Typography>
            <Typography><strong>Cond. Pagamento:</strong> N/A</Typography>
            <Typography><strong>Valor OSC Total:</strong> {formatCurrency(calculateTotal('valor_osc'))}</Typography>
            <Typography><strong>Valor Venda Total:</strong> {formatCurrency(calculateTotalVenda())}</Typography>
            <Typography><strong>Valor Cout Total:</strong> {formatCurrency(calculateTotal('valor_cout'))}</Typography>
          </Grid>

          {/* Coluna 3: Datas */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Datas Relevantes</Typography>
            <Typography><strong>Data de Solicitação:</strong> {formatDate(quote.data_criacao)}</Typography>
            <Typography><strong>Data de Fechamento:</strong> {formatDate(quote.data_fechamento)}</Typography>
            <Typography><strong>Outras Datas:</strong> Ver itens abaixo</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* TABELA DE ITENS DA COTAÇÃO (permanece a mesma, pois já estava correta) */}
        <Typography variant="h5" gutterBottom>
          Itens da Cotação
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto (SKU)</TableCell>
                <TableCell>Distribuidor</TableCell>
                <TableCell>Data da Cotação</TableCell>
                <TableCell>Data de Retorno</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Valor Unitário</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quote.itens && quote.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{`${item.produto_nome} (${item.produto_sku})`}</TableCell>
                  <TableCell>{item.distribuidor_nome}</TableCell>
                  <TableCell>{formatDate(item.data_cotacao)}</TableCell>
                  <TableCell>{formatDate(item.data_retorno)}</TableCell>
                  <TableCell>{formatDateTime(item.data_registro)}</TableCell>
                  <TableCell align="right">{item.quantidade}</TableCell>
                  <TableCell align="right">{formatCurrency(item.valor_unitario)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.quantidade * (item.valor_unitario || 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
    
  </> // PASSO 3: Não se esqueça de fechar o fragmento no final
  );
}
