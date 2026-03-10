// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CustomThemeProvider } from './config/theme.jsx'; // 0. IMPORTAR NOSSO TEMA CUSTOMIZADO
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx'; // 1. IMPORTAR

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <BrowserRouter>  {/* 2. MOVER O BROWSERROUTER PARA CÁ */}
        <AuthProvider> {/* 3. ENVOLVER O APP COM O AUTHPROVIDER */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  </React.StrictMode>
);