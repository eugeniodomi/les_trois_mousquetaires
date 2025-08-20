// src/pages/SearchPage.jsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
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
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const fakeApiSearch = async (filters) => {
  console.log("Filtros enviados para a API:", filters);
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (filters.searchTerm.trim() === '' || filters.searchAreas.length === 0) return [];
  
  let allResults = [];

  if (filters.searchAreas.includes('produtos')) {
    allResults.push(
      { id: 'p1', type: 'Produto', title: `Produto: ${filters.searchTerm}`, field1: `Categoria: Eletrônicos` },
      { id: 'p2', type: 'Produto', title: `Produto: ${filters.searchTerm} Plus`, field1: `SKU: 12345` }
    );
  }
  if (filters.searchAreas.includes('distribuidores')) {
    allResults.push(
      { id: 'd1', type: 'Distribuidor', title: `Distribuidor: ${filters.searchTerm}`, field1: `Contato: João Silva` }
    );
  }
  
  return allResults;
};

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
  const [searchAreas, setSearchAreas] = useState(['produtos']); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const theme = useTheme();

  const handleSearchAreaChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSearchAreas((prev) => [...prev, value]);
    } else {
      setSearchAreas((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleSearch = async () => {
    setHasSearched(true);
    setLoading(true);
    setError('');
    setResults([]);
    const filters = { searchTerm, searchAreas }; 
    try {
      const data = await fakeApiSearch(filters);
      setResults(data);
    } catch (err) {
      setError('Houve um erro ao realizar a busca.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Main open={filtersOpen}>
        <Typography variant="h4" gutterBottom>
          Busca
        </Typography>

        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            label="Digite o termo da busca" 
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<SearchIcon />}
            sx={{ height: '56px', whiteSpace: 'nowrap' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
          </Button>
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)} sx={{ height: '56px', width: '56px' }}>
            {filtersOpen ? <ChevronRightIcon /> : <FilterListIcon />}
          </IconButton>
        </Paper>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && hasSearched && results.length === 0 && <Typography>Nenhum resultado.</Typography>}
        <Grid container spacing={3}>
          {results.map((result) => (
            <Grid item xs={12} sm={6} md={4} key={result.id}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{result.type}</Typography>
                  <Typography variant="h6">{result.title}</Typography>
                  <Typography>{result.field1}</Typography>
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
                control={
                  <Checkbox
                    checked={searchAreas.includes('produtos')}
                    onChange={handleSearchAreaChange}
                    value="produtos"
                  />
                }
                label="Produtos"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={searchAreas.includes('distribuidores')}
                    onChange={handleSearchAreaChange}
                    value="distribuidores"
                  />
                }
                label="Distribuidores"
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