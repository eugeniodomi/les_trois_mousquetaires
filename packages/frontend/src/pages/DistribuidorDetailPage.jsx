import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// Importe o serviço para buscar um distribuidor por ID
import { getDistributorById } from '../services/distributorService';

// Função auxiliar para formatar data e hora (ex: 28/08/2025 14:30:00)
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    // Adiciona 'Z' para garantir que a data seja tratada como UTC e convertida para o fuso horário local
    return new Date(dateString).toLocaleString('pt-BR');
};

export default function DistribuidorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDistributorDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDistributorById(id);
        setDistributor(data);
      } catch (err) {
        setError(err.message || 'Ocorreu um erro ao buscar os detalhes do distribuidor.');
      } finally {
        setLoading(false);
      }
    };
    loadDistributorDetails();
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
                onClick={() => navigate('/distribuidores')}
                sx={{ mt: 2 }}
            >
                Voltar para a Lista
            </Button>
        </Box>
    );
  }

  if (!distributor) {
    return <Typography variant="h5">Distribuidor não encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/distribuidores')}
        >
          Voltar para a Lista
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/distribuidores/${id}/editar`)} // Rota para futura página de edição
        >
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes do Distribuidor: {distributor.nome}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ID: {distributor.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações da Empresa</Typography>
            <Typography><strong>Nome:</strong> {distributor.nome || 'N/A'}</Typography>
            <Typography><strong>CNPJ:</strong> {distributor.cnpj || 'N/A'}</Typography>
            <Typography><strong>Status:</strong> {distributor.status || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações de Contato</Typography>
            <Typography><strong>Nome do Contato:</strong> {distributor.contato_nome || 'N/A'}</Typography>
            <Typography><strong>Email:</strong> {distributor.contato_email || 'N/A'}</Typography>
            <Typography><strong>Telefone:</strong> {distributor.telefone || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">Datas</Typography>
            <Typography><strong>Data de Cadastro:</strong> {formatDateTime(distributor.data_cadastro)}</Typography>
            <Typography><strong>Última Atualização:</strong> {formatDateTime(distributor.data_atualizacao)}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
