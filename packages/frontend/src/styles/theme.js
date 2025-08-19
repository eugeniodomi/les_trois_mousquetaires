// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Um azul como cor primária
    },
    secondary: {
      main: '#dc004e', // Um rosa/vermelho como secundária
    },
    background: {
      default: '#f4f6f8', // Um cinza claro para o fundo
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  //customizar espaçamentos, bordas etc
});