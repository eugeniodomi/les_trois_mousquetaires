import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Grid, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EditProfile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    foto_url: '',
    novaSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.name || user.nome || '',
        email: user.email || '',
        cargo: user.cargo || '',
        foto_url: user.foto_url || '',
        novaSenha: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${user.id}`, {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        foto_url: formData.foto_url || null,
        novaSenha: formData.novaSenha || undefined,
      });

      setMessage({ type: 'success', text: response.data.msg });
      
      // Atualizar localStorage
      const updatedUser = { ...user, ...response.data.user, name: response.data.user.nome };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Recarregar p limpar a senha
      setFormData(prev => ({ ...prev, novaSenha: '' }));
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          Editar Perfil
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="center" mb={3}>
            <Avatar 
              src={formData.foto_url || undefined} 
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}
            >
              {!formData.foto_url && formData.nome ? formData.nome.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Foto URL (Opcional)"
                name="foto_url"
                value={formData.foto_url}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Nova Senha (deixe em branco para não alterar)"
                name="novaSenha"
                value={formData.novaSenha}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 4, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
