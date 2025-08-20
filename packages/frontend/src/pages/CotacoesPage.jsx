// src/pages/CotacoesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAR O useNavigate
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// --- SIMULAÇÃO DE DADOS DO BANCO (para Cotações) ---
const fetchCotacoesFromDB = async () => {
  console.log("Buscando cotações no 'banco de dados'...");
  await new Promise(resolve => setTimeout(resolve, 1000));

  const statuses = ['Aberta', 'Finalizada', 'Cancelada'];
  const requesters = ['Loja A', 'Filial B', 'Centro de Distribuição C'];
  
  const mockCotacoes = Array.from({ length: 50 }, (_, index) => ({
    id: `COT-${202500 + index}`,
    status: statuses[index % statuses.length],
    creationDate: new Date(2025, 7, 20 - index),
    requester: requesters[index % requesters.length],
    itemCount: Math.floor(Math.random() * 20) + 1,
  }));

  return mockCotacoes;
};

export default function CotacoesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. INICIALIZAR O useNavigate

  useEffect(() => {
    const loadCotacoes = async () => {
      setLoading(true);
      const cotacoes = await fetchCotacoesFromDB();
      setRows(cotacoes);
      setLoading(false);
    };

    loadCotacoes();
  }, []);

  // 3. FUNÇÃO PARA LIDAR COM O CLIQUE NA LINHA
  const handleRowClick = (params) => {
    // params.id contém o ID da linha que foi clicada
    navigate(`/cotacoes/${params.id}`);
  };

  const columns = [
    { field: 'id', headerName: 'ID Cotação', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        if (status === 'Aberta') color = 'primary';
        if (status === 'Finalizada') color = 'success';
        if (status === 'Cancelada') color = 'error';
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: 'creationDate',
      headerName: 'Data de Criação',
      type: 'date',
      width: 180,
      valueGetter: (value) => new Date(value),
    },
    { field: 'requester', headerName: 'Solicitante', width: 220, flex: 1 },
    { field: 'itemCount', headerName: 'Nº de Itens', type: 'number', width: 130 },
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
            sorting: { sortModel: [{ field: 'creationDate', sort: 'desc' }] },
          }}
          
          // 4. ADICIONAR AS PROPRIEDADES DE CLIQUE E ESTILO
          onRowClick={handleRowClick}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
          
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}