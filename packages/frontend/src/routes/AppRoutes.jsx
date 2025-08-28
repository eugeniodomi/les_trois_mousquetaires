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
          
          {/* --- ROTAS DE DISTRIBUIDORES CORRIGIDAS E AGRUPADAS --- */}
          <Route path="distribuidores">
            {/* Rota para a lista de distribuidores -> /distribuidores */}
            <Route index element={<DistribuidoresPage />} />
            
            {/* Rota para cadastrar um novo distribuidor -> /distribuidores/novo */}
            <Route path="novo" element={<CadastroDistribuidoresPage />} />
            
            {/* Futuramente, você pode adicionar rotas de detalhe e edição aqui */}
            {/* <Route path=":id" element={<DistibuidorDetailPage />} /> */}
            {/* <Route path=":id/editar" element={<EditarDistribuidorPage />} /> */}
          </Route>
          
          {/* --- ROTAS DE COTAÇÕES --- */}
          <Route path="cotacoes">
            {/* Rota para a lista de cotações -> /cotacoes */}
            <Route index element={<CotacoesPage />} />
            
            {/* Rota para cadastrar uma nova cotação -> /cotacoes/cadastrar */}
            <Route path="cadastrar" element={<CadastroCotacaoPage />} />
            
            {/* Rota para ver o detalhe de uma cotação -> /cotacoes/:id */}
            <Route path=":id" element={<CotacaoDetailPage />} />

            {/* Rota para editar uma cotação -> /cotacoes/:id/editar */}
            <Route path=":id/editar" element={<EditarCotacaoPage />} />
          </Route>

          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="buscar" element={<SearchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
