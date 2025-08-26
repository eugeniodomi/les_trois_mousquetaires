// src/routes/AppRoutes.jsx

import { Routes, Route } from 'react-router-dom';

// 1. IMPORTS NECESSÁRIOS
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Imports das páginas
import HomePage from '../pages/HomePage';
import ProdutosPage from '../pages/ProdutosPage';
import DistribuidoresPage from '../pages/DistribuidoresPage';
import CotacoesPage from '../pages/CotacoesPage';
import CotacaoDetailPage from '../pages/CotacaoDetailPage';
import DashboardsPage from '../pages/DashboardsPage';
import SearchPage from '../pages/SearchPage';
import CadastroCotacaoPage from '../pages/CadastroCotacaoPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 2. ROTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* 3. ROTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="distribuidores" element={<DistribuidoresPage />} />
          
          {/* --- ESTRUTURA DE ROTAS DE COTAÇÕES ATUALIZADA --- */}
          <Route path="cotacoes">
            {/* Rota para a lista de cotações */}
            <Route index element={<CotacoesPage />} />
            
            {/* ✅ Rota para 'cadastrar' uma nova cotação, evitando conflito */}
            <Route path="cadastrar" element={<CadastroCotacaoPage />} />
            
            {/* Rota para ver o detalhe de uma cotação específica */}
            <Route path=":id" element={<CotacaoDetailPage />} />
          </Route>
          {/* --- FIM DA ATUALIZAÇÃO --- */}

          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="buscar" element={<SearchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}