// src/routes/AppRoutes.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';

import ProdutosPage from '../pages/ProdutosPage'; 
import DistribuidoresPage from '../pages/DistribuidoresPage'; 
import CotacoesPage from '../pages/CotacoesPage'; 
import RelatoriosPage from '../pages/RelatoriosPage'; 
import SearchPage from '../pages/SearchPage';


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/*  uma rota "wrapper". renderiza o Layout... */}
        <Route path="/" element={<Layout />}>
          {/* ...e qualquer rota aqui dentro será renderizada onde o <Outlet /> está. */}
          <Route index element={<HomePage />} />
          {/* Exemplo: <Route path="relatorios" element={<PaginaDeRelatorios />} /> */}
          <Route path="produtos" element={<ProdutosPage />} /> {/* Adicionar */}
          <Route path="distribuidores" element={<DistribuidoresPage />} /> {/* Adicionar */}
          <Route path="cotacoes" element={<CotacoesPage />} /> {/* Adicionar */}
          <Route path="relatorios" element={<RelatoriosPage />} /> {/* Adicionar */}
          <Route path="buscar" element={<SearchPage />} /> {/* Adicionar */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}