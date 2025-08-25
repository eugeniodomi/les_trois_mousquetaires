import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Drawer,
  IconButton,
  styled,
  useTheme,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
// O ícone de busca não é mais necessário no botão, mas pode ser útil no TextField
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { globalSearchApi } from '../services/searchService.js';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  }),
);

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // NOVO ESTADO: Armazena o termo de busca após a pausa na digitação (debouncing)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchAreas, setSearchAreas] = useState(['produto', 'distribuidor', 'usuario', 'categoria']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const theme = useTheme();

  // EFEITO 1: DEBOUNCING
  // Este efeito cria um timer para atualizar o 'debouncedSearchTerm' somente
  // 300ms após o usuário parar de digitar.
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de atraso

    // Função de limpeza: cancela o timer anterior a cada nova tecla digitada
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // EFEITO 2: CHAMADA À API
  // Este efeito é disparado sempre que o 'debouncedSearchTerm' muda.
  // É aqui que a busca acontece.
  useEffect(() => {
    const performSearch = async () => {
      // Condição: só busca se o termo tiver 3+ caracteres
      if (debouncedSearchTerm.length >= 3) {
        setHasSearched(true);
        setLoading(true);
        setError('');
        try {
          const data = await globalSearchApi(debouncedSearchTerm);
          // O filtro dos checkboxes continua funcionando aqui no frontend
          const filteredData = data.filter(item => searchAreas.includes(item.tipo));
          setResults(filteredData);

          if (filteredData.length === 0 && data.length > 0) {
            setError("Nenhum resultado encontrado para os filtros selecionados.");
          }
        } catch (err) {
          setError(err.message || 'Houve um erro ao realizar a busca.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        // Limpa os resultados se a busca for muito curta
        setResults([]);
        setHasSearched(false);
        setError('');
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchAreas]); // Roda a busca de novo se os filtros mudarem também

  const handleSearchAreaChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSearchAreas((prev) => [...prev, value]);
    } else {
      setSearchAreas((prev) => prev.filter((area) => area !== value));
    }
  };

  const formatType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Main open={filtersOpen}>
        <Typography variant="h4" gutterBottom>
          Busca Inteligente
        </Typography>

        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            label="Digite para buscar..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Mostra o spinner de carregamento diretamente no campo de busca
            InputProps={{
              endAdornment: loading ? <CircularProgress size={24} /> : null,
            }}
          />
          {/* O BOTÃO "BUSCAR" FOI REMOVIDO */}
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)} sx={{ height: '56px', width: '56px' }}>
            {filtersOpen ? <ChevronRightIcon /> : <FilterListIcon />}
          </IconButton>
        </Paper>

        {error && <Typography color="error">{error}</Typography>}
        {!loading && hasSearched && results.length === 0 && !error && <Typography>Nenhum resultado encontrado.</Typography>}

        <Grid container spacing={3}>
          {results.map((result) => (
            <Grid item xs={12} sm={6} md={4} key={`${result.tipo}-${result.id}`}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {formatType(result.tipo)}
                  </Typography>
                  <Typography variant="h6">{result.titulo}</Typography>
                  <Typography>{result.subtitulo}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Main>
      {/* O Drawer de filtros permanece exatamente o mesmo */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={filtersOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, ...theme.mixins.toolbar, justifyContent: 'flex-start' }}>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <ChevronRightIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>Filtros</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Buscar em:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={searchAreas.includes('produto')} onChange={handleSearchAreaChange} value="produto" />}
                label="Produtos"
              />
              <FormControlLabel
                control={<Checkbox checked={searchAreas.includes('distribuidor')} onChange={handleSearchAreaChange} value="distribuidor" />}
                label="Distribuidores"
              />
              <FormControlLabel
                control={<Checkbox checked={searchAreas.includes('usuario')} onChange={handleSearchAreaChange} value="usuario" />}
                label="Usuários"
              />
              <FormControlLabel
                control={<Checkbox checked={searchAreas.includes('categoria')} onChange={handleSearchAreaChange} value="categoria" />}
                label="Categorias"
              />
            </FormGroup>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Typography>Outros filtros...</Typography>
        </Box>
      </Drawer>
    </Box>
  );
}