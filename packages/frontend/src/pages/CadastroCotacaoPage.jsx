import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper, IconButton,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, Divider,
  Snackbar, Alert, CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

// --- SERVIÇOS DA API ---
import { getProducts } from '../services/productService';
import { getDistributors } from '../services/distributorService';
import { createQuotation } from '../services/quotationService';

// --- DADOS MOCKADOS (Apenas para Usuários) ---
const mockUsuarios = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Oliveira' },
  { id: 3, nome: 'Carlos Pereira' },
];

const itemCotacaoInicial = {
  produto_id: null,
  distribuidor_id: null,
  quantidade: 1,
  valor_cout: '',
  valor_osc: '',
  valor_venda_final: '',
  valor_unitario: '',
  dolar_cotacao: '',
  data_cotacao: '',
  data_retorno: '',
};

function CadastroCotacaoPage() {
  const navigate = useNavigate();
  const nextItemId = useRef(0);

  // --- ESTADOS DO COMPONENTE ---
  const [cotacao, setCotacao] = useState({
    descricao: '',
    usuario_criador_id: '',
    status: 'Aberta',
  });
  
  const [itens, setItens] = useState([{ ...itemCotacaoInicial, uniqueId: `temp_${nextItemId.current++}` }]);
  
  const [produtos, setProdutos] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [produtosData, distribuidoresData] = await Promise.all([
          getProducts(),
          getDistributors()
        ]);

        const uniqueProdutos = Array.from(new Map(produtosData.map(item => [item.id, item])).values());
        const uniqueDistribuidores = Array.from(new Map(distribuidoresData.map(item => [item.id, item])).values());

        setProdutos(uniqueProdutos);
        setDistribuidores(uniqueDistribuidores);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setPageError("Falha ao carregar dados essenciais. Verifique a conexão com a API e tente novamente.");
      } finally {
        setPageLoading(false);
      }
    };
    carregarDados();
  }, []);

  // --- HANDLERS (sem alterações) ---
  const handleCotacaoChange = (event) => {
    const { name, value } = event.target;
    setCotacao((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const novosItens = [...itens];
    novosItens[index][name] = value;
    setItens(novosItens);
  };
  const handleAutocompleteChange = (index, name, value) => {
    const novosItens = [...itens];
    novosItens[index][name] = value ? value.id : null;
    setItens(novosItens);
  };
  const adicionarItem = () => {
    const novoItem = { ...itemCotacaoInicial, uniqueId: `temp_${nextItemId.current++}` };
    setItens([...itens, novoItem]);
  };
  const removerItem = (index) => {
    if (itens.length > 1) setItens(itens.filter((_, i) => i !== index));
  };
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    const payload = { ...cotacao, itens_cotacao: itens };
    try {
      await createQuotation(payload);
      setNotification({ open: true, message: 'Cotação salva com sucesso!', severity: 'success' });
      setTimeout(() => navigate('/cotacoes'), 1500);
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Erro ao salvar a cotação.', severity: 'error' });
      setFormLoading(false);
    }
  };
  
  if (pageLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (pageError) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{pageError}</Typography>;
  }

  return (
    <>
      {/* --- MUDANÇA 1: AUMENTANDO A LARGURA MÁXIMA DA PÁGINA --- */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Cadastro de Nova Cotação
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={7}>
                <TextField name="descricao" label="Descrição da Cotação" value={cotacao.descricao} onChange={handleCotacaoChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={5}>
                {/* --- MUDANÇA 2: FORÇANDO LARGURA MÍNIMA NO CAMPO DE USUÁRIO --- */}
                <FormControl fullWidth required sx={{ minWidth: 280 }}>
                  <InputLabel id="usuario-criador-label">Usuário Criador</InputLabel>
                  <Select
                    labelId="usuario-criador-label" name="usuario_criador_id"
                    value={cotacao.usuario_criador_id} label="Usuário Criador" onChange={handleCotacaoChange}
                  >
                    {mockUsuarios.map((user) => (
                      <MenuItem key={user.id} value={user.id}>{user.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select labelId="status-label" name="status" value={cotacao.status} label="Status" disabled >
                    <MenuItem value="Aberta">Aberta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}><Typography variant="h6">Itens da Cotação</Typography></Divider>

            {itens.map((item, index) => (
              <Paper key={item.uniqueId} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  
                  <Grid item xs={12}>
                    {/* --- MUDANÇA 2: FORÇANDO LARGURA MÍNIMA NO CAMPO DE PRODUTO --- */}
                    <Autocomplete
                      options={produtos}
                      getOptionLabel={(option) => `${option.nome} (SKU: ${option.sku || 'N/A'})`}
                      value={produtos.find(p => p.id === item.produto_id) || null}
                      onChange={(event, newValue) => handleAutocompleteChange(index, 'produto_id', newValue)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => <TextField {...params} label="Produto" required fullWidth />}
                      sx={{ minWidth: 300 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {/* --- MUDANÇA 2: FORÇANDO LARGURA MÍNIMA NO CAMPO DE DISTRIBUIDOR --- */}
                    <Autocomplete
                      options={distribuidores}
                      getOptionLabel={(option) => option.nome}
                      value={distribuidores.find(d => d.id === item.distribuidor_id) || null}
                      onChange={(event, newValue) => handleAutocompleteChange(index, 'distribuidor_id', newValue)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => <TextField {...params} label="Distribuidor" required fullWidth />}
                      sx={{ minWidth: 300 }}
                    />
                  </Grid>
                  
                  {/* Campos numéricos e de data (sem alterações) */}
                  <Grid item xs={6} sm={4} md={2}><TextField name="quantidade" label="Quantidade" type="number" value={item.quantidade} onChange={(e) => handleItemChange(index, e)} fullWidth required/></Grid>
                  <Grid item xs={6} sm={4} md={2}><TextField name="valor_unitario" label="Valor Unitário" type="number" value={item.valor_unitario} onChange={(e) => handleItemChange(index, e)} fullWidth/></Grid>
                  <Grid item xs={6} sm={4} md={2}><TextField name="valor_cout" label="Valor QUOTE" type="number" value={item.valor_cout} onChange={(e) => handleItemChange(index, e)} fullWidth/></Grid>
                  <Grid item xs={6} sm={4} md={2}><TextField name="valor_osc" label="Valor OSC" type="number" value={item.valor_osc} onChange={(e) => handleItemChange(index, e)} fullWidth/></Grid>
                  <Grid item xs={6} sm={4} md={2}><TextField name="valor_venda_final" label="Venda Final" type="number" value={item.valor_venda_final} onChange={(e) => handleItemChange(index, e)} fullWidth/></Grid>
                  <Grid item xs={6} sm={4} md={2}><TextField name="dolar_cotacao" label="Dólar Cotação" type="number" value={item.dolar_cotacao} onChange={(e) => handleItemChange(index, e)} fullWidth/></Grid>
                  <Grid item xs={12} sm={5}><TextField name="data_cotacao" label="Data de Início da Cotação" type="date" value={item.data_cotacao} onChange={(e) => handleItemChange(index, e)} fullWidth InputLabelProps={{ shrink: true }}/></Grid>
                  <Grid item xs={12} sm={5}><TextField name="data_retorno" label="Data de Retorno" type="date" value={item.data_retorno} onChange={(e) => handleItemChange(index, e)} fullWidth InputLabelProps={{ shrink: true }}/></Grid>
                  <Grid item xs={12} sm={2} container justifyContent="flex-end"><IconButton onClick={() => removerItem(index)} color="error" disabled={itens.length === 1}><DeleteIcon /></IconButton></Grid>

                </Grid>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
              <Button startIcon={<AddCircleOutlineIcon />} onClick={adicionarItem} variant="outlined" disabled={formLoading} >Adicionar Item</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/cotacoes')} disabled={formLoading}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={formLoading} startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}>
                  {formLoading ? 'Salvando...' : 'Salvar Cotação'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CadastroCotacaoPage;