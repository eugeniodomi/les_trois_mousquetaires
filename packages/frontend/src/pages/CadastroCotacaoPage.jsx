import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, Box, Paper, IconButton,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, Divider,
  Snackbar, Alert, CircularProgress, Stepper, Step, StepLabel, Chip,
  Card, CardContent, CardHeader, Collapse, Tooltip, Fade,
  Switch, FormControlLabel,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

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

const STEPS = ['Dados Gerais', 'Itens da Cotação', 'Revisão'];

// Campos que ficam ocultos no Modo Rápido
const CAMPOS_SECUNDARIOS = ['valor_venda_final', 'dolar_cotacao', 'data_retorno'];

// ─── Sub-component: Item Card ──────────────────────────────────────────────
function ItemCard({ item, index, total, isCotacaoRapida, produtos, distribuidores, onItemChange, onAutocompleteChange, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  const produtoSelecionado = produtos.find(p => p.id === item.produto_id) || null;
  const distribuidorSelecionado = distribuidores.find(d => d.id === item.distribuidor_id) || null;

  const resumo = produtoSelecionado
    ? `${produtoSelecionado.nome}${distribuidorSelecionado ? ' · ' + distribuidorSelecionado.nome : ''}`
    : `Item ${index + 1} — não configurado`;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 3 },
      }}
    >
      {/* Card Header — always visible */}
      <Box
        onClick={() => setExpanded(v => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: 'action.hover',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`#${index + 1}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, minWidth: 40 }}
          />
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 480 }}>
            {resumo}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {total > 1 && (
            <Tooltip title="Remover item">
              <IconButton
                size="small"
                color="error"
                onClick={e => { e.stopPropagation(); onRemove(index); }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <CardContent sx={{ px: 3, pt: 2.5, pb: 3 }}>
          {/* Row 1: Produto + Distribuidor */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={produtos}
                getOptionLabel={o => `${o.nome} (SKU: ${o.sku || 'N/A'})`}
                value={produtoSelecionado}
                onChange={(_, v) => onAutocompleteChange(index, 'produto_id', v)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={params => (
                  <TextField {...params} variant="standard" label="Produto *" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={distribuidores}
                getOptionLabel={o => o.nome}
                value={distribuidorSelecionado}
                onChange={(_, v) => onAutocompleteChange(index, 'distribuidor_id', v)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={params => (
                  <TextField {...params} variant="standard" label="Distribuidor *" fullWidth />
                )}
              />
            </Grid>
          </Grid>

          {/* Separator label */}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Valores & Quantidades
          </Typography>

          {/* Row 2: Quantities & Values */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                variant="standard" name="quantidade" label="Quantidade" type="number"
                value={item.quantidade} onChange={e => onItemChange(index, e)} fullWidth required
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                variant="standard" name="valor_unitario" label="Vlr. Unitário" type="number"
                value={item.valor_unitario} onChange={e => onItemChange(index, e)} fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                variant="standard" name="valor_cout" label="Vlr. QUOTE" type="number"
                value={item.valor_cout} onChange={e => onItemChange(index, e)} fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                variant="standard" name="valor_osc" label="Vlr. OSC" type="number"
                value={item.valor_osc} onChange={e => onItemChange(index, e)} fullWidth
              />
            </Grid>
            {/* Campos secundários — ocultos no Modo Rápido */}
            {!isCotacaoRapida && (
              <>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    variant="standard" name="valor_venda_final" label="Venda Final" type="number"
                    value={item.valor_venda_final} onChange={e => onItemChange(index, e)} fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    variant="standard" name="dolar_cotacao" label="Dólar Cotação" type="number"
                    value={item.dolar_cotacao} onChange={e => onItemChange(index, e)} fullWidth
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Separator label */}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            Datas
          </Typography>

          {/* Row 3: Dates */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="standard" name="data_cotacao" label="Data de Início da Cotação" type="date"
                value={item.data_cotacao} onChange={e => onItemChange(index, e)} fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* data_retorno — oculta no Modo Rápido */}
            {!isCotacaoRapida && (
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="standard" name="data_retorno" label="Data de Retorno" type="date"
                  value={item.data_retorno} onChange={e => onItemChange(index, e)} fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}

// ─── Review Step ────────────────────────────────────────────────────────────
function ReviewSummary({ cotacao, itens, produtos, distribuidores }) {
  const getUsuarioNome = id => mockUsuarios.find(u => u.id === Number(id))?.nome || '—';
  const getProdutoNome = id => produtos.find(p => p.id === id)?.nome || '—';
  const getDistribuidorNome = id => distribuidores.find(d => d.id === id)?.nome || '—';

  return (
    <Fade in>
      <Box>
        {/* General Data Summary */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="overline" color="primary" fontWeight={700}>
            Dados Gerais
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Descrição</Typography>
              <Typography fontWeight={500}>{cotacao.descricao || '—'}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Usuário Criador</Typography>
              <Typography fontWeight={500}>{getUsuarioNome(cotacao.usuario_criador_id)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Chip label={cotacao.status} size="small" color="success" variant="outlined" sx={{ mt: 0.5, fontWeight: 600 }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Items Summary */}
        <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
          Itens ({itens.length})
        </Typography>
        {itens.map((item, i) => (
          <Paper
            key={item.uniqueId}
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, mb: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}
          >
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Produto</Typography><Typography fontWeight={500}>{getProdutoNome(item.produto_id)}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Distribuidor</Typography><Typography fontWeight={500}>{getDistribuidorNome(item.distribuidor_id)}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Qtd.</Typography><Typography>{item.quantidade}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Vlr. Unitário</Typography><Typography>{item.valor_unitario || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Vlr. QUOTE</Typography><Typography>{item.valor_cout || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Vlr. OSC</Typography><Typography>{item.valor_osc || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Venda Final</Typography><Typography>{item.valor_venda_final || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Dólar Cotação</Typography><Typography>{item.dolar_cotacao || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Data Cotação</Typography><Typography>{item.data_cotacao || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Data Retorno</Typography><Typography>{item.data_retorno || '—'}</Typography></Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Fade>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function CadastroCotacaoPage() {
  const navigate = useNavigate();
  const nextItemId = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isCotacaoRapida, setIsCotacaoRapida] = useState(false);

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

  // --- HANDLERS (sem alterações na submissão) ---
  const handleCotacaoChange = (event) => {
    const { name, value } = event.target;
    setCotacao((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle do Modo Rápido: ao ativar, zera os campos secundários de todos os itens
  // para garantir que o banco não receba valores undefined.
  const handleToggleModoRapido = (event) => {
    const ativando = event.target.checked;
    setIsCotacaoRapida(ativando);
    if (ativando) {
      setItens(prev =>
        prev.map(item => ({
          ...item,
          valor_venda_final: 0,
          dolar_cotacao: 0,
          data_retorno: '',
        }))
      );
    }
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    // Protege o estado: ignora alterações em campos ocultos no modo rápido
    if (isCotacaoRapida && CAMPOS_SECUNDARIOS.includes(name)) return;
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

    // ── Helpers de sanitização ──────────────────────────────────────────────
    // Converte qualquer valor numérico inválido (NaN, undefined, "") para 0.
    const safeNum = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    // Converte string vazia de data para null (PostgreSQL rejeita "" em DATE).
    const safeDate = (v) => (v === '' || v == null ? null : v);

    // ── Objeto de nível superior — tabela `cotacoes` ────────────────────────
    const cotacaoBase = {
      descricao:          cotacao.descricao.trim(),
      usuario_criador_id: cotacao.usuario_criador_id,
      status:             cotacao.status,
    };

    // ── Array de itens — tabela `dados_cotacoes` ────────────────────────────
    const itensCotacao = itens.map((item) => ({
      produto_id:        item.produto_id,
      distribuidor_id:   item.distribuidor_id,
      quantidade:        safeNum(item.quantidade),
      valor_unitario:    safeNum(item.valor_unitario),
      valor_cout:        safeNum(item.valor_cout),
      valor_osc:         safeNum(item.valor_osc),
      valor_venda_final: safeNum(item.valor_venda_final), // 0 quando Modo Rápido
      dolar_cotacao:     safeNum(item.dolar_cotacao),     // 0 quando Modo Rápido
      data_cotacao:      safeDate(item.data_cotacao),
      data_retorno:      safeDate(item.data_retorno),     // null quando Modo Rápido
    }));

    // ── Payload final (master-detalhe) ──────────────────────────────────────
    const payload = {
      ...cotacaoBase,
      itens_cotacao: itensCotacao,
    };

    // ── Requisição ──────────────────────────────────────────────────────────
    try {
      await createQuotation(payload);
      setNotification({ open: true, message: 'Cotação salva com sucesso!', severity: 'success' });
      setTimeout(() => navigate('/cotacoes'), 1500);
    } catch (error) {
      console.error('[CadastroCotacao] Erro ao salvar:', error);
      setNotification({
        open: true,
        message: error.message || 'Erro inesperado ao salvar a cotação. Tente novamente.',
        severity: 'error',
      });
      setFormLoading(false);
    }
  };

  if (pageLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (pageError) return <Typography color="error" align="center" sx={{ mt: 4 }}>{pageError}</Typography>;

  // Step icons
  const stepIcons = [AssignmentOutlinedIcon, ListAltOutlinedIcon, CheckCircleOutlineIcon];

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>

        {/* ── Page Header ── */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Nova Cotação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados gerais e adicione os itens para criar a cotação.
          </Typography>
        </Box>

        {/* ── Stepper Navigation ── */}
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': { fontWeight: 500 },
            '& .MuiStepConnector-line': { borderColor: 'divider' },
          }}
          alternativeLabel
        >
          {STEPS.map((label, i) => {
            const Icon = stepIcons[i];
            return (
              <Step key={label} completed={activeStep > i}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 38, height: 38, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'action.disabledBackground',
                        color: completed || active ? 'white' : 'text.disabled',
                        transition: 'all 0.3s ease',
                        boxShadow: active ? 3 : 0,
                      }}
                    >
                      {completed ? <CheckCircleOutlineIcon fontSize="small" /> : <Icon fontSize="small" />}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* ── Main Content Panel ── */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, borderColor: 'divider' }}
        >
          <Box component="form" onSubmit={handleSubmit}>

            {/* ═══════════ STEP 0: Dados Gerais ═══════════ */}
            {activeStep === 0 && (
              <Fade in key="step0">
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <AssignmentOutlinedIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>Dados Gerais da Cotação</Typography>
                  </Box>

                  <Grid container spacing={4}>
                    {/* Descrição — full width */}
                    <Grid item xs={12}>
                      <TextField
                        variant="standard"
                        name="descricao"
                        label="Descrição da Cotação"
                        value={cotacao.descricao}
                        onChange={handleCotacaoChange}
                        fullWidth
                        required
                        helperText="Escreva um título claro que identifique esta cotação"
                        inputProps={{ style: { fontSize: '1.05rem' } }}
                      />
                    </Grid>

                    {/* Usuário Criador */}
                    <Grid item xs={12} sm={6}>
                      <FormControl variant="standard" fullWidth required>
                        <InputLabel id="usuario-criador-label">Usuário Criador</InputLabel>
                        <Select
                          labelId="usuario-criador-label"
                          name="usuario_criador_id"
                          value={cotacao.usuario_criador_id}
                          onChange={handleCotacaoChange}
                        >
                          {mockUsuarios.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Status — disabled */}
                    <Grid item xs={12} sm={6}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select labelId="status-label" name="status" value={cotacao.status} disabled>
                          <MenuItem value="Aberta">Aberta</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* ── Modo Rápido Toggle ── */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1,
                          p: 2,
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: isCotacaoRapida ? 'primary.main' : 'divider',
                          bgcolor: isCotacaoRapida ? 'primary.50' : 'transparent',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Modo Cotação Rápida
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Oculta campos secundários (Venda Final, Dólar e Data de Retorno).
                            Esses campos serão salvos com valores padrão seguros.
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isCotacaoRapida}
                              onChange={handleToggleModoRapido}
                              color="primary"
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* ═══════════ STEP 1: Itens da Cotação ═══════════ */}
            {activeStep === 1 && (
              <Fade in key="step1">
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ListAltOutlinedIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>Itens da Cotação</Typography>
                      <Chip label={`${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={adicionarItem}
                      variant="outlined"
                      size="small"
                      disabled={formLoading}
                    >
                      Adicionar Item
                    </Button>
                  </Box>

                  {itens.map((item, index) => (
                    <ItemCard
                      key={item.uniqueId}
                      item={item}
                      index={index}
                      total={itens.length}
                      isCotacaoRapida={isCotacaoRapida}
                      produtos={produtos}
                      distribuidores={distribuidores}
                      onItemChange={handleItemChange}
                      onAutocompleteChange={handleAutocompleteChange}
                      onRemove={removerItem}
                    />
                  ))}
                </Box>
              </Fade>
            )}

            {/* ═══════════ STEP 2: Revisão ═══════════ */}
            {activeStep === 2 && (
              <Fade in key="step2">
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <CheckCircleOutlineIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>Revisão Final</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Confirme os dados abaixo antes de salvar a cotação.
                  </Typography>
                  <ReviewSummary
                    cotacao={cotacao}
                    itens={itens}
                    produtos={produtos}
                    distribuidores={distribuidores}
                  />
                </Box>
              </Fade>
            )}

            {/* ── Navigation Buttons ── */}
            <Divider sx={{ my: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="text"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={() => activeStep === 0 ? navigate('/cotacoes') : setActiveStep(s => s - 1)}
                disabled={formLoading}
              >
                {activeStep === 0 ? 'Cancelar' : 'Voltar'}
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setActiveStep(s => s + 1)}
                  disableElevation
                  disabled={
                    (activeStep === 0 && (!cotacao.descricao || !cotacao.usuario_criador_id)) ||
                    (activeStep === 1 && itens.some(i => !i.produto_id || !i.distribuidor_id || !i.quantidade))
                  }
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disableElevation
                  size="large"
                  startIcon={formLoading ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  disabled={formLoading}
                >
                  {formLoading ? 'Salvando...' : 'Salvar Cotação'}
                </Button>
              )}
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

export default CadastroCotacaoPage;