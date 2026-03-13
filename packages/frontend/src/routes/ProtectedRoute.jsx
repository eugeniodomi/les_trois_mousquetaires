import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuth();

  if (!user) {
    // Se não há usuário logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // 🔐 RBAC: Se a rota for exclusiva para admin/root e o usuário não for, redireciona para a Home
  if (adminOnly && !['root', 'admin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Se o usuário está logado (e tem permissão), renderiza a página
  return <Outlet />;
}