import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper,
  Snackbar, Alert, CircularProgress, Divider, MenuItem,
  Stepper, Step, StepLabel, Card, CardContent, Chip, Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { createProduct } from '../services/productService';

const STEPS = ['Dados Básicos', 'Detalhes', 'Revisão'];

const categoriasDisponiveis = [
  { id: 1, nome: 'Produtos' },
  { id: 2, nome: 'Serviços' },
];

function ReviewRow({ label, value }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || <span style={{ color: '#aaa' }}>Não informado</span>}
      </Typography>
    </Box>
  );
}

function CadastroProdutosPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // ── Estado do formulário (inalterado) ──
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    sku: '',
    categoria_id: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // ── Handlers (inalterados) ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    if (!formData.nome?.trim()) {
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

  const categoriaNome = categoriasDisponiveis.find(c => c.id === Number(formData.categoria_id))?.nome || '—';

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Cadastro de Produto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha as informações em {STEPS.length} etapas simples.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Conteúdo das etapas */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 4 }}>

              {/* ─── STEP 0: Dados Básicos ─── */}
              {activeStep === 0 && (
                <Fade in key="step0">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                      Dados Básicos
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          variant="standard"
                          name="nome"
                          label="Nome do Produto *"
                          value={formData.nome}
                          onChange={handleChange}
                          fullWidth
                          required
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          variant="standard"
                          id="categoria-select"
                          name="categoria_id"
                          value={formData.categoria_id === null ? '' : formData.categoria_id}
                          onChange={handleChange}
                          label="Categoria"
                          fullWidth
                          select
                        >
                          <MenuItem value=""><em>Nenhuma</em></MenuItem>
                          {categoriasDisponiveis.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}

              {/* ─── STEP 1: Detalhes ─── */}
              {activeStep === 1 && (
                <Fade in key="step1">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                      Detalhes do Produto
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          variant="standard"
                          name="sku"
                          label="SKU (Código de Referência)"
                          value={formData.sku || ''}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          variant="standard"
                          name="descricao"
                          label="Descrição do Produto"
                          value={formData.descricao || ''}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}

              {/* ─── STEP 2: Revisão ─── */}
              {activeStep === 2 && (
                <Fade in key="step2">
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <CheckCircleOutlineIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>Revisão Final</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Confirme os dados antes de salvar.
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <ReviewRow label="Nome do Produto" value={formData.nome} />
                      <ReviewRow label="Categoria" value={categoriaNome} />
                      <Divider sx={{ my: 2 }} />
                      <ReviewRow label="SKU" value={formData.sku} />
                      <ReviewRow label="Descrição" value={formData.descricao} />
                    </Paper>
                  </Box>
                </Fade>
              )}

            </CardContent>
          </Card>

          {/* ── Botões de navegação ── */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="button"
              variant="text"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => activeStep === 0 ? navigate('/produtos') : setActiveStep(s => s - 1)}
              disabled={formLoading}
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setActiveStep(s => s + 1)}
                disableElevation
                disabled={activeStep === 0 && !formData.nome?.trim()}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                disableElevation
                startIcon={formLoading ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                disabled={formLoading}
                sx={{ px: 4, fontWeight: 700 }}
              >
                {formLoading ? 'Salvando...' : 'Confirmar e Salvar Produto'}
              </Button>
            )}
          </Box>
        </Box>
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