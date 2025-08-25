// src/pages/CotacoesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// 1. IMPORTAR A FUNÇÃO DE SERVIÇO EM VEZ DE USAR DADOS MOCK
import { getCotacoes } from '../services/quotationService'; // Ajuste o caminho se necessário

export default function CotacoesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 2. FUNÇÃO PARA CARREGAR DADOS REAIS DA API
    const loadCotacoes = async () => {
      try {
        setLoading(true);
        const cotacoesDaApi = await getCotacoes();
        setRows(cotacoesDaApi); // Define os dados recebidos no estado
      } catch (error) {
        console.error("Erro ao carregar cotações na página:", error);
        // Opcional: Adicionar um estado de erro para exibir uma mensagem na UI
      } finally {
        setLoading(false);
      }
    };

    loadCotacoes();
  }, []); // O array vazio garante que isso rode apenas uma vez

  const handleRowClick = (params) => {
    // A navegação continua funcionando, agora com o ID real do item
    navigate(`/cotacoes/${params.id}`);
  };

  // 3. COLUNAS ATUALIZADAS PARA CORRESPONDER AOS DADOS DO BACKEND
  const columns = [
    { field: 'id', headerName: 'ID Item', width: 100 },
    { 
      field: 'produto_nome', 
      headerName: 'Produto', 
      width: 250, 
      flex: 1 
    },
    { 
      field: 'distribuidor_nome', 
      headerName: 'Distribuidor', 
      width: 250, 
      flex: 1 
    },
    {
      field: 'valor_venda_final',
      headerName: 'Valor Final (R$)',
      type: 'number',
      width: 150,
      valueFormatter: (value) => value ? `R$ ${parseFloat(value).toFixed(2)}` : '',
    },
    { 
      field: 'quantidade', 
      headerName: 'Quantidade', 
      type: 'number', 
      width: 120 
    },
    { 
      field: 'usuario_nome', 
      headerName: 'Solicitante', 
      width: 200 
    },
    {
      field: 'data_registro',
      headerName: 'Data de Registro',
      type: 'dateTime',
      width: 180,
      valueGetter: (value) => new Date(value),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Cotações
      </Typography>
      <Paper sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'data_registro', sort: 'desc' }] },
          }}
          onRowClick={handleRowClick}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}