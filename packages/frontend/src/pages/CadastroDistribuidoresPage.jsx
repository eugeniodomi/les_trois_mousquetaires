import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper,
  Snackbar, Alert, CircularProgress, Divider
} from '@mui/material';

// --- SERVIÇOS DA API ---
import { createDistributor } from '../services/distributorService';

function CadastroDistribuidoresPage() {
  const navigate = useNavigate();

  // --- ESTADOS DO COMPONENTE ---
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    contato_nome: '',
    contato_email: '',
    telefone: ''
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!formData.nome.trim()) {
      setNotification({ open: true, message: 'O nome do distribuidor é obrigatório.', severity: 'error' });
      setFormLoading(false);
      return;
    }

    try {
      await createDistributor(formData);
      setNotification({ open: true, message: 'Distribuidor cadastrado com sucesso!', severity: 'success' });
      
      // Aguarda a notificação ser vista e depois redireciona
      setTimeout(() => {
        navigate('/distribuidores');
      }, 1500);

    } catch (err) {
      setNotification({ open: true, message: err.message || 'Ocorreu um erro ao cadastrar.', severity: 'error' });
      setFormLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Cadastro de Novo Distribuidor
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Informações Básicas
            </Typography>

            <Grid container spacing={3}>
              {/* --- DADOS PRINCIPAIS --- */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="nome"
                  label="Nome do Distribuidor"
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
                  name="cnpj"
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              {/* --- DADOS DE CONTATO --- */}
              <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle1" color="text.secondary">Informações de Contato</Typography>
                 </Divider>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="contato_nome"
                  label="Nome do Contato"
                  value={formData.contato_nome}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="contato_email"
                  label="Email do Contato"
                  type="email"
                  value={formData.contato_email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  name="telefone"
                  label="Telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* --- BOTÕES DE AÇÃO --- */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate('/distribuidores')} 
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
                {formLoading ? 'Salvando...' : 'Salvar Distribuidor'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* --- COMPONENTE DE NOTIFICAÇÃO --- */}
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

export default CadastroDistribuidoresPage;
