import React from 'react';
import { Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


export default function GlobalSearchBar() {
  const handleSearch = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      console.log('Pesquisando por:', event.target.value);
      // No futuro,  pode usar o `useNavigate` para ir para a página de busca
      // navigate(`/buscar?q=${event.target.value}`);
    }
  };

  return (
    <Paper sx={{ p: 0.5, mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por produto, distribuidor, cotação..."
        onKeyDown={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Paper>
  );
}