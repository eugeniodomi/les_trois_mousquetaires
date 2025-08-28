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
import EditarCotacaoPage from '../pages/EditarCotacaoPage';
import CadastroDistribuidoresPage from '../pages/CadastroDistribuidoresPage';

// 👇 1. IMPORTE A NOVA PÁGINA DE DETALHES
import DistribuidorDetailPage from '../pages/DistribuidorDetailPage';


export default function AppRoutes() {
  return (
    <Routes>
      {/* ROTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* ROTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          
          {/* --- ROTAS DE DISTRIBUIDORES --- */}
          <Route path="distribuidores">
            <Route index element={<DistribuidoresPage />} />
            <Route path="novo" element={<CadastroDistribuidoresPage />} />
            
            {/* 👇 2. ADICIONE A NOVA ROTA DE DETALHES AQUI */}
            <Route path=":id" element={<DistribuidorDetailPage />} />
            
            {/* Futuramente, você pode criar uma página de edição e descomentar a rota abaixo */}
            {/* <Route path=":id/editar" element={<EditarDistribuidorPage />} /> */}
          </Route>
          
          {/* --- ROTAS DE COTAÇÕES --- */}
          <Route path="cotacoes">
            <Route index element={<CotacoesPage />} />
            <Route path="cadastrar" element={<CadastroCotacaoPage />} />
            <Route path=":id" element={<CotacaoDetailPage />} />
            <Route path=":id/editar" element={<EditarCotacaoPage />} />
          </Route>

          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="buscar" element={<SearchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
