import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper,
  Snackbar, Alert, CircularProgress, Divider, MenuItem
} from '@mui/material';

// --- SERVIÇOS DA API ---
import { createProduct } from '../services/productService';

// --- DADOS MOCKADOS PARA AS CATEGORIAS ---
const categoriasDisponiveis = [
  { id: 1, nome: 'Produtos' },
  { id: 2, nome: 'Serviços' },
];

function CadastroProdutosPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    sku: '',
    categoria_id: null
  });
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value === '' ? null : value
    }));
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!formData.nome.trim()) {
      setNotification({ open: true, message: 'O campo "Nome" é obrigatório.', severity: 'error' });
      setFormLoading(false);
      return;
    }

    try {
      await createProduct(formData);
      setNotification({ open: true, message: 'Produto cadastrado com sucesso!', severity: 'success' });
      setTimeout(() => navigate('/produtos'), 1500);
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Ocorreu um erro ao cadastrar o produto.', severity: 'error' });
      setFormLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Cadastro de Novo Produto
          </Typography>
          
          <Divider sx={{ my: 3 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Informações do Produto
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="nome"
                  label="Nome do Produto"
                  value={formData.nome}
                  onChange={handleChange}
                  fullWidth
                  required
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="sku"
                  label="SKU (Código de Referência)"
                  value={formData.sku}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  id="categoria-select"
                  name="categoria_id"
                  value={formData.categoria_id === null ? '' : formData.categoria_id}
                  onChange={handleChange}
                  label="Categoria"
                  fullWidth
                  select
                >
                  {categoriasDisponiveis.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  name="descricao"
                  label="Descrição do Produto"
                  value={formData.descricao}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate('/produtos')} 
                disabled={formLoading}
              >
                Cancelar / Voltar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disableElevation
                disabled={formLoading}
                startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {formLoading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CadastroProdutosPage;