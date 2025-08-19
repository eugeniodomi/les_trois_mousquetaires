// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Importe as ferramentas do MUI e o seu tema
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolva o seu componente <App /> com o ThemeProvider */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza os estilos e aplica a cor de fundo do tema */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);