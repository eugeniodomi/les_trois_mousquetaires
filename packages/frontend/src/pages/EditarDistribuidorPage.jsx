import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper,
  Snackbar, Alert, CircularProgress, Divider
} from '@mui/material';

// Importa os serviços da API necessários
import { getDistributorById, updateDistributor } from '../services/distributorService';

function EditarDistribuidorPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- ESTADOS DO COMPONENTE ---
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Efeito para carregar os dados do distribuidor ao montar a página
  useEffect(() => {
    const carregarDadosDistribuidor = async () => {
      try {
        setLoading(true);
        const data = await getDistributorById(id);
        if (!data) {
          throw new Error("Distribuidor não encontrado.");
        }
        setFormData(data);
      } catch (err) {
        setError(err.message || "Ocorreu um erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    carregarDadosDistribuidor();
  }, [id]);

  // --- HANDLERS ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);

    try {
      // O payload são os próprios dados do formulário
      await updateDistributor(id, formData);
      setNotification({ open: true, message: 'Distribuidor atualizado com sucesso!', severity: 'success' });
      
      // Redireciona para a página de detalhes após a atualização
      setTimeout(() => navigate(`/distribuidores/${id}`), 1500);
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Erro ao atualizar o distribuidor.', severity: 'error' });
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
            Editar Distribuidor #{id}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* O formulário só é renderizado quando formData não é nulo */}
          {formData && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField name="nome" label="Nome do Distribuidor" value={formData.nome || ''} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField name="cnpj" label="CNPJ" value={formData.cnpj || ''} onChange={handleChange} fullWidth />
                </Grid>

                <Grid item xs={12}>
                   <Divider sx={{ my: 1 }}><Typography variant="subtitle1">Informações de Contato</Typography></Divider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField name="contato_nome" label="Nome do Contato" value={formData.contato_nome || ''} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField name="contato_email" label="Email do Contato" type="email" value={formData.contato_email || ''} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField name="telefone" label="Telefone" value={formData.telefone || ''} onChange={handleChange} fullWidth />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button variant="outlined" color="secondary" onClick={() => navigate(`/distribuidores/${id}`)} disabled={formLoading}>Cancelar</Button>
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

export default EditarDistribuidorPage;
