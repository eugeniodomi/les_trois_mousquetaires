// src/routes/AppRoutes.jsx

import { Routes, Route } from 'react-router-dom';

// 1. IMPORTS NECESSÁRIOS
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute'; // O "segurança" das nossas rotas
import LoginPage from '../pages/LoginPage';     // A nova página de login
import RegisterPage from '../pages/RegisterPage';


// Imports das páginas existentes (organizados)
import HomePage from '../pages/HomePage';
import ProdutosPage from '../pages/ProdutosPage';
import DistribuidoresPage from '../pages/DistribuidoresPage';
import CotacoesPage from '../pages/CotacoesPage';
import CotacaoDetailPage from '../pages/CotacaoDetailPage';
import DashboardsPage from '../pages/DashboardsPage';
import SearchPage from '../pages/SearchPage';

export default function AppRoutes() {
  return (
  
    <Routes>
      {/* 2. ROTA PÚBLICA: Acessível a todos */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* 3. ROTAS PROTEGIDAS: Só podem ser acessadas após o login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* Todas as suas rotas antigas agora estão aqui dentro */}
          <Route index element={<HomePage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="distribuidores" element={<DistribuidoresPage />} />
          <Route path="cotacoes" element={<CotacoesPage />} />
          <Route path="cotacoes/:id" element={<CotacaoDetailPage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="buscar" element={<SearchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}