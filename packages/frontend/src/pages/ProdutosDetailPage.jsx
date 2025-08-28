import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// Importe o serviço para buscar um produto por ID
import { getProductById } from '../services/productService';

export default function ProdutosDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Ocorreu um erro ao buscar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };
    loadProductDetails();
  }, [id]);

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
                onClick={() => navigate('/produtos')}
                sx={{ mt: 2 }}
            >
                Voltar para a Lista
            </Button>
        </Box>
    );
  }

  if (!product) {
    return <Typography variant="h5">Produto não encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtos')}
        >
          Voltar para a Lista
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/produtos/${id}/editar`)} // Rota para futura página de edição
        >
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes do Produto: {product.nome}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ID: {product.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Nome:</strong> {product.nome || 'N/A'}</Typography>
            <Typography><strong>SKU:</strong> {product.sku || 'N/A'}</Typography>
            <Typography><strong>Categoria:</strong> {product.nome_categoria || 'Não categorizado'}</Typography>
            <Typography><strong>Status:</strong> {product.status || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Descrição</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{product.descricao || 'Nenhuma descrição fornecida.'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
