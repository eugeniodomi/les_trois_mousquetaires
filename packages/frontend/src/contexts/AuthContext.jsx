import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor do Contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Efeito para verificar se já existe um usuário no localStorage ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Função de Login
  const login = async (email, password) => {
    console.log("Tentando login com:", email, password);
    // --- SIMULAÇÃO DE CHAMADA À API ---
    // No futuro, aqui você fará a chamada real com Axios para o seu backend
    // const response = await axios.post('/api/auth/login', { email, password });
    // const userData = response.data;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula espera
    
    // Simula uma resposta de sucesso da API
    const userData = { name: 'genio', email: email, token: 'aladin' };

    // Guarda o usuário no localStorage e no estado
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Redireciona para a página inicial após o login
    navigate('/');
  };

  // Função de Logout
  const logout = () => {
    // Remove o usuário do localStorage e do estado
    localStorage.removeItem('user');
    setUser(null);
    // Redireciona para a página de login
    navigate('/login');
  };

 const register = async (name, email, password) => {
    console.log("Tentando registrar com:", name, email, password);
    // --- SIMULAÇÃO DE CHAMADA À API DE REGISTRO ---
    // No futuro, você fará a chamada real para o seu backend Node.js
    // await axios.post('/api/auth/register', { name, email, password });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula espera

    // Após o registro bem-sucedido, o ideal é logar o usuário automaticamente.
    // O backend, ao criar o usuário, poderia retornar o mesmo que o endpoint de login.
    console.log("Registro bem-sucedido! Efetuando login automático...");
    
    // Reutilizamos nossa função de login para criar a sessão do novo usuário.
    await login(email, password);
  };

  // Adiciona a função 'register' ao valor do contexto
  const value = { user, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Criar um Hook customizado para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}