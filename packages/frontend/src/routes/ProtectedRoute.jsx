import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // Ensure this path is also correct (.jsx)

export default function ProtectedRoute() {
  const auth = useAuth();

  if (!auth.user) {
    // Se não há usuário logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // Se o usuário está logado, renderiza a página que ele tentou acessar
  return <Outlet />;
}