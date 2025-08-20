import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, Paper } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    try {
      setError('');
      await auth.register(name, email, password);
      // A navegação será feita pela função de login dentro do register
    } catch (err) {
      setError('Falha ao criar a conta. Tente novamente.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper elevation={3} sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4
      }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registrar
        </Typography>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal" required fullWidth id="name"
            label="Nome Completo" name="name" autoComplete="name" autoFocus
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth id="email"
            label="Endereço de Email" name="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password"
            label="Senha" type="password" id="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="confirmPassword"
            label="Confirmar Senha" type="password" id="confirmPassword"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Registrar
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Já tem uma conta? Entre
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}