import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button, 
  Grid, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getQuotationById } from '../services/quotationService';

// Funções auxiliares
const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
};

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
        if (data.itens_cotacao) {
          data.itens = data.itens_cotacao;
        }
        setQuote(data);
      } catch (err) {
        setError(err.message || 'Ocorreu um erro ao buscar a cotação.');
      } finally {
        setLoading(false);
      }
    };
    loadQuoteDetails();
  }, [id]);

  const calculateTotal = (field) => {
    if (!quote || !quote.itens) return 0;
    return quote.itens.reduce((sum, item) => {
      const itemTotal = (Number(item.quantidade) || 0) * (Number(item[field]) || 0);
      return sum + itemTotal;
    }, 0);
  };

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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cotacoes')}
        >
          Voltar para a Lista
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/cotacoes/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Cotação #{quote.id}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {quote.descricao}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Status:</strong> {quote.status || 'N/A'}</Typography>
            <Typography><strong>Criado por:</strong> {quote.usuario_criador_nome || `ID: ${quote.usuario_criador_id}`}</Typography>
          </Grid>
          
          <Grid xs={12} md={4}>
            <Typography variant="h6">Totais Financeiros</Typography>
            <Typography><strong>Total Quote:</strong> {formatCurrency(calculateTotal('valor_cout'))}</Typography>
            <Typography><strong>Total OSC:</strong> {formatCurrency(calculateTotal('valor_osc'))}</Typography>
            <Typography><strong>Total Venda Final:</strong> {formatCurrency(calculateTotal('valor_venda_final'))}</Typography>
          </Grid>

          <Grid xs={12} md={4}>
            <Typography variant="h6">Datas Relevantes</Typography>
            <Typography><strong>Data de Criação:</strong> {formatDateTime(quote.data_criacao)}</Typography>
            <Typography><strong>Data de Fechamento:</strong> {formatDateTime(quote.data_fechamento)}</Typography>
            <Typography><strong>Data da Cotação (Item):</strong> {formatDate(quote.itens?.[0]?.data_cotacao)}</Typography>
            <Typography><strong>Data de Retorno (Item):</strong> {formatDate(quote.itens?.[0]?.data_retorno)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Itens da Cotação
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              {/* 🚨 CORREÇÃO FINAL: O erro também estava aqui. Removidos os espaços entre as células do cabeçalho. */}
              <TableRow>
                <TableCell>Produto (SKU)</TableCell><TableCell>Distribuidor</TableCell><TableCell align="right">Qtd.</TableCell><TableCell align="right">Valor Unitário</TableCell><TableCell align="right">Valor Quote</TableCell><TableCell align="right">Valor OSC</TableCell><TableCell align="right">Venda Final</TableCell><TableCell align="right">Dólar (R$)</TableCell><TableCell align="right">Subtotal</TableCell><TableCell>Data Cotação</TableCell><TableCell>Data Retorno</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quote.itens?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{`${item.produto_nome || 'N/A'} (${item.produto_sku || 'N/A'})`}</TableCell><TableCell>{item.distribuidor_nome || 'N/A'}</TableCell><TableCell align="right">{item.quantidade}</TableCell><TableCell align="right">{formatCurrency(item.valor_unitario)}</TableCell><TableCell align="right">{formatCurrency(item.valor_cout)}</TableCell><TableCell align="right">{formatCurrency(item.valor_osc)}</TableCell><TableCell align="right">{formatCurrency(item.valor_venda_final)}</TableCell><TableCell align="right">{formatCurrency(item.dolar_cotacao)}</TableCell><TableCell align="right">{formatCurrency(item.quantidade * (item.valor_venda_final || item.valor_unitario || 0))}</TableCell><TableCell>{formatDate(item.data_cotacao)}</TableCell><TableCell>{formatDate(item.data_retorno)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}