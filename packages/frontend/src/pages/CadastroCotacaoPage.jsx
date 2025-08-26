import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // PASSO 1: Importar useNavigate
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Divider,
  Snackbar, // Para notificações
  Alert,    // Para o conteúdo da notificação
  CircularProgress, // Para o estado de loading
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

// --- DADOS MOCKADOS (Substitua por chamadas à sua API no futuro) ---
const mockUsuarios = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Oliveira' },
  { id: 3, nome: 'Carlos Pereira' },
];

const mockProdutos = [
  { id: 101, nome: 'Parafuso Sextavado 1/4"', sku: 'PAR-SEXT-14' },
  { id: 102, nome: 'Furadeira de Impacto 500W', sku: 'FUR-IMP-500' },
  { id: 103, nome: 'Caixa de Ferramentas 24 Peças', sku: 'CX-FERR-24P' },
];

const mockDistribuidores = [
  { id: 1, nome: 'Distribuidora Parafusos & Cia' },
  { id: 2, nome: 'Ferramentas Brasil S.A.' },
  { id: 3, nome: 'Importadora Geral' },
];
// --- FIM DOS DADOS MOCKADOS ---

const itemCotacaoInicial = {
  produto_id: null,
  distribuidor_id: null,
  quantidade: 1,
  valor_cout: '',
  valor_osc: '',
  valor_venda_final: '',
  valor_unitario: '',
  dolar_cotacao: '',
  data_retorno: '',
};

function CadastroCotacaoPage() {
  const navigate = useNavigate(); // PASSO 2: Inicializar o hook de navegação

  // Estado para os campos da tabela 'cotacoes'
  const [cotacao, setCotacao] = useState({
    descricao: '',
    usuario_criador_id: '',
    status: 'Aberta',
  });

  // Estado para a lista de itens da cotação
  const [itens, setItens] = useState([{ ...itemCotacaoInicial }]);
  
  // PASSO 3: Estados para loading e notificações
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

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
  }

  const adicionarItem = () => {
    setItens([...itens, { ...itemCotacaoInicial }]);
  };

  const removerItem = (index) => {
    if (itens.length > 1) {
      const novosItens = itens.filter((_, i) => i !== index);
      setItens(novosItens);
    }
  };

  // PASSO 4: Função de submit aprimorada
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...cotacao,
      itens_cotacao: itens,
    };

    try {
      // Simula uma chamada de API
      console.log('Dados a serem enviados para a API:', payload);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência de rede

      setNotification({ open: true, message: 'Cotação salva com sucesso!', severity: 'success' });

      // Redireciona para a página de listagem após um pequeno atraso para o usuário ver a mensagem
      setTimeout(() => {
        navigate('/cotacoes');
      }, 1000);

    } catch (error) {
      console.error("Erro ao salvar cotação:", error);
      setNotification({ open: true, message: 'Erro ao salvar a cotação. Tente novamente.', severity: 'error' });
      setLoading(false);
    } 
    // O setLoading(false) é omitido do `finally` para que o botão continue desabilitado durante o redirecionamento
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Cadastro de Nova Cotação
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            {/* SEÇÃO MESTRE DA COTAÇÃO */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="descricao"
                  label="Descrição da Cotação"
                  value={cotacao.descricao}
                  onChange={handleCotacaoChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required>
                  <InputLabel id="usuario-criador-label">Usuário Criador</InputLabel>
                  <Select
                    labelId="usuario-criador-label"
                    name="usuario_criador_id"
                    value={cotacao.usuario_criador_id}
                    label="Usuário Criador"
                    onChange={handleCotacaoChange}
                  >
                    {mockUsuarios.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={cotacao.status}
                    label="Status"
                    onChange={handleCotacaoChange}
                    disabled
                  >
                    <MenuItem value="Aberta">Aberta</MenuItem>
                    <MenuItem value="Em Análise">Em Análise</MenuItem>
                    <MenuItem value="Fechada">Fechada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}>
              <Typography variant="h6">Itens da Cotação</Typography>
            </Divider>

            {/* SEÇÃO DOS ITENS DA COTAÇÃO (DINÂMICO) */}
            {itens.map((item, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>Item {index + 1}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={mockProdutos}
                      getOptionLabel={(option) => `${option.nome} (SKU: ${option.sku})`}
                      value={mockProdutos.find(p => p.id === item.produto_id) || null}
                      onChange={(event, newValue) => handleAutocompleteChange(index, 'produto_id', newValue)}
                      renderInput={(params) => <TextField {...params} label="Produto" required />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={mockDistribuidores}
                        getOptionLabel={(option) => option.nome}
                        value={mockDistribuidores.find(d => d.id === item.distribuidor_id) || null}
                        onChange={(event, newValue) => handleAutocompleteChange(index, 'distribuidor_id', newValue)}
                        renderInput={(params) => <TextField {...params} label="Distribuidor" required />}
                      />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                      <TextField name="quantidade" label="Quantidade" type="number" value={item.quantidade} onChange={(e) => handleItemChange(index, e)} fullWidth required/>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                      <TextField name="valor_unitario" label="Valor Unitário" type="number" value={item.valor_unitario} onChange={(e) => handleItemChange(index, e)} fullWidth/>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                      <TextField name="valor_cout" label="Valor COUT" type="number" value={item.valor_cout} onChange={(e) => handleItemChange(index, e)} fullWidth/>
                  </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField name="valor_osc" label="Valor OSC" type="number" value={item.valor_osc} onChange={(e) => handleItemChange(index, e)} fullWidth/>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                      <TextField name="valor_venda_final" label="Venda Final" type="number" value={item.valor_venda_final} onChange={(e) => handleItemChange(index, e)} fullWidth/>
                  </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField name="dolar_cotacao" label="Dólar Cotação" type="number" value={item.dolar_cotacao} onChange={(e) => handleItemChange(index, e)} fullWidth/>
                  </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField name="data_retorno" label="Data de Retorno" type="date" value={item.data_retorno} onChange={(e) => handleItemChange(index, e)} fullWidth InputLabelProps={{ shrink: true }}/>
                  </Grid>

                  <Grid item xs={12} sm={2} md={1}>
                    <IconButton onClick={() => removerItem(index)} color="error" disabled={itens.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={adicionarItem}
                variant="outlined"
                disabled={loading}
              >
                Adicionar Item
              </Button>
            </Box>

            {/* BOTÕES DE AÇÃO ATUALIZADOS */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
               <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate('/cotacoes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Salvando...' : 'Salvar Cotação'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* COMPONENTE DE NOTIFICAÇÃO */}
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

export default CadastroCotacaoPage;