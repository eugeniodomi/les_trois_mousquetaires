import React, { useState, useEffect } from 'react';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { globalSearchApi } from '../services/searchService.js';
// PASSO 1: Importar o useNavigate para navegação
import { useNavigate } from 'react-router-dom';

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchAreas, setSearchAreas] = useState(['produto', 'distribuidor', 'usuario', 'categoria', 'cotacao']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const theme = useTheme();
  // PASSO 2: Inicializar o hook useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.length >= 3) {
        setHasSearched(true);
        setLoading(true);
        setError('');
        try {
          const data = await globalSearchApi(debouncedSearchTerm);
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
        setResults([]);
        setHasSearched(false);
        setError('');
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchAreas]);

  // PASSO 3: Criar a função para lidar com o clique no card
  const handleCardClick = (result) => {
    let path = '';
    // Define o caminho com base no 'tipo' do resultado
    switch (result.tipo) {
      case 'produto':
        path = `/produtos/${result.id}`;
        break;
      case 'distribuidor':
        path = `/distribuidores/${result.id}`;
        break;
      case 'cotacao':
        path = `/cotacoes/${result.id}`;
        break;
      default:
        // Se for outro tipo (usuário, categoria), não faz nada
        return;
    }
    // Navega para a página de detalhes
    navigate(path);
  };

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
            InputProps={{
              endAdornment: loading ? <CircularProgress size={24} /> : null,
            }}
          />
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)} sx={{ height: '56px', width: '56px' }}>
            {filtersOpen ? <ChevronRightIcon /> : <FilterListIcon />}
          </IconButton>
        </Paper>

        {error && <Typography color="error">{error}</Typography>}
        {!loading && hasSearched && results.length === 0 && !error && <Typography>Nenhum resultado encontrado.</Typography>}

        <Grid container spacing={3}>
          {results.map((result) => (
            <Grid item xs={12} sm={6} md={4} key={`${result.tipo}-${result.id}`}>
              {/* PASSO 4: Adicionar o onClick e a estilização para o Card */}
              <Card
                onClick={() => handleCardClick(result)}
                sx={{
                  // Apenas adiciona o cursor de ponteiro se o item for clicável
                  cursor: ['produto', 'distribuidor', 'cotacao'].includes(result.tipo) ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: ['produto', 'distribuidor', 'cotacao'].includes(result.tipo) ? 'scale(1.03)' : 'none',
                    boxShadow: ['produto', 'distribuidor', 'cotacao'].includes(result.tipo) ? 6 : 1, // Aumenta a sombra no hover
                  },
                }}
              >
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
                control={<Checkbox checked={searchAreas.includes('cotacao')} onChange={handleSearchAreaChange} value="cotacao" />}
                label="Cotações"
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