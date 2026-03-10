// src/routes/AppRoutes.jsx

import { Routes, Route } from 'react-router-dom';

// IMPORTS NECESSÁRIOS
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Imports das páginas
import HomePage from '../pages/HomePage';
import EditProfile from '../pages/EditProfile';
import ProdutosPage from '../pages/ProdutosPage';
import DistribuidoresPage from '../pages/DistribuidoresPage';
import CotacoesPage from '../pages/CotacoesPage';
import CotacaoDetailPage from '../pages/CotacaoDetailPage';
import DashboardsPage from '../pages/DashboardsPage';
import SearchPage from '../pages/SearchPage';
import CadastroCotacaoPage from '../pages/CadastroCotacaoPage';
import EditarCotacaoPage from '../pages/EditarCotacaoPage';
import CadastroDistribuidoresPage from '../pages/CadastroDistribuidoresPage';
import DistribuidorDetailPage from '../pages/DistribuidorDetailPage';
import EditarDistribuidorPage from '../pages/EditarDistribuidorPage';
import DistributorAnalytics from '../pages/DistributorAnalytics';


import ProdutosDetailPage from '../pages/ProdutosDetailPage';
import EditarProdutoPage from '../pages/EditarProdutoPage';
import ProductAnalytics from '../pages/ProductAnalytics';


// 👇 1. IMPORTE A NOVA PÁGINA DE CADASTRO DE PRODUTO
import CadastroProdutosPage from '../pages/CadastroProdutosPage';


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
          <Route path="perfil" element={<EditProfile />} />
          
          {/* --- ROTAS DE DISTRIBUIDORES --- */}
          <Route path="distribuidores">
            <Route index element={<DistribuidoresPage />} />
            <Route path="analytics" element={<DistributorAnalytics />} />
            <Route path="novo" element={<CadastroDistribuidoresPage />} />
            <Route path=":id" element={<DistribuidorDetailPage />} />
            <Route path=":id/editar" element={<EditarDistribuidorPage />} />
          </Route>
          
          {/* --- ROTAS DE COTAÇÕES --- */}
          <Route path="cotacoes">
            <Route index element={<CotacoesPage />} />
            <Route path="cadastrar" element={<CadastroCotacaoPage />} />
            <Route path=":id" element={<CotacaoDetailPage />} />
            <Route path=":id/editar" element={<EditarCotacaoPage />} />
          </Route>


          {/* --- ROTAS DE PRODUTOS --- */}
          <Route path="produtos">
            <Route index element={<ProdutosPage />} />
            <Route path="analytics" element={<ProductAnalytics />} />
            <Route path="novo" element={<CadastroProdutosPage />} />
            <Route path=":id" element={<ProdutosDetailPage />} />
            <Route path=":id/editar" element={<EditarProdutoPage />} />
          </Route>

          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="buscar" element={<SearchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}