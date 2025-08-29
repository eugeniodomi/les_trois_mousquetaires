import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper,
  Snackbar, Alert, CircularProgress, Divider,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

// Importa os serviços da API necessários
import { getProductById, updateProduct } from '../services/productService';

// Simula as categorias disponíveis, assim como na página de cadastro
const categoriasDisponiveis = [
  { id: 1, nome: 'Produtos' },
  { id: 2, nome: 'Serviços' },
];

function EditarProdutoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- ESTADOS DO COMPONENTE ---
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Efeito para carregar os dados do produto ao montar a página
  useEffect(() => {
    const carregarDadosProduto = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (!data) {
          throw new Error("Produto não encontrado.");
        }
        setFormData(data);
      } catch (err) {
        setError(err.message || "Ocorreu um erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    carregarDadosProduto();
  }, [id]);

  // --- HANDLERS ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);

    if (!formData.nome || !formData.nome.trim()) {
        setNotification({ open: true, message: 'O nome do produto é obrigatório.', severity: 'error' });
        setFormLoading(false);
        return;
    }

    try {
      await updateProduct(id, formData);
      setNotification({ open: true, message: 'Produto atualizado com sucesso!', severity: 'success' });
      
      // Redireciona para a página de detalhes após a atualização
      setTimeout(() => navigate(`/produtos/${id}`), 1500);
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Erro ao atualizar o produto.', severity: 'error' });
      setFormLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Editar Produto #{id}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* O formulário só é renderizado quando formData não é nulo */}
          {formData && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField name="nome" label="Nome do Produto" value={formData.nome || ''} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="descricao" label="Descrição do Produto" value={formData.descricao || ''} onChange={handleChange} fullWidth multiline rows={3} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField name="sku" label="SKU (Código de Referência)" value={formData.sku || ''} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="categoria-select-label">Categoria</InputLabel>
                    <Select
                      labelId="categoria-select-label"
                      name="categoria_id"
                      value={formData.categoria_id || ''}
                      label="Categoria"
                      onChange={handleChange}
                    >
                      {categoriasDisponiveis.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button variant="outlined" color="secondary" onClick={() => navigate(`/produtos/${id}`)} disabled={formLoading}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={formLoading} startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}>
                  {formLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
      
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </>
  );
}

export default EditarProdutoPage;
