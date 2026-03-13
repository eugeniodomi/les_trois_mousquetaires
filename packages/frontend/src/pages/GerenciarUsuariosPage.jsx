import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Select, 
  MenuItem, 
  Snackbar, 
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export default function GerenciarUsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      showSnackbar(error.response?.data?.msg || error.response?.data?.error || 'Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API_BASE_URL}/usuarios/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showSnackbar('Nível de acesso atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      showSnackbar('Erro ao atualizar nível de acesso', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestão de Permissões
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Visualize e gerencie os níveis de acesso de todos os usuários do sistema.
      </Typography>

      <Card sx={{ p: 4, mt: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cargo (Company)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nível de Acesso (System Role)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.cargo || 'N/A'}</TableCell>
                    <TableCell>
                      <Select
                        value={row.role || 'user'}
                        onChange={(e) => handleRoleChange(row.id, e.target.value)}
                        variant="standard"
                        sx={{ minWidth: 120 }}
                        // lock 1: disable if target is root and requester is not root
                        disabled={row.role === 'root' && user?.role !== 'root'}
                      >
                        {/* lock 2: hide root option for non-root requesters */}
                        {user?.role === 'root' && <MenuItem value="root">Root (Master)</MenuItem>}
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="priority">Priority</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
