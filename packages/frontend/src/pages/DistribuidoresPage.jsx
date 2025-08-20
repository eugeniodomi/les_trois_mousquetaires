// src/pages/DistribuidoresPage.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// --- SIMULAÇÃO DE DADOS DO BANCO (agora para Distribuidores) ---
const fetchDistributorsFromDB = async () => {
  console.log("Buscando distribuidores no 'banco de dados'...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Cria 100 distribuidores falsos para o exemplo
  const mockDistributors = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    cnpj: `00.123.${456 + index}/0001-${10 + index}`,
    name: `Distribuidor ${String.fromCharCode(65 + (index % 26))}${index}`,
    city: `Cidade ${Math.ceil((index + 1) / 5)}`,
    contact: `Contato ${index + 1}`,
  }));

  return mockDistributors;
};

export default function DistribuidoresPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect para buscar os dados quando o componente carregar
  useEffect(() => {
    const loadDistributors = async () => {
      setLoading(true);
      const distributors = await fetchDistributorsFromDB();
      setRows(distributors);
      setLoading(false);
    };

    loadDistributors();
  }, []);

  // Definição das colunas da tabela de Distribuidores
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cnpj', headerName: 'CNPJ', width: 200 },
    {
      field: 'name',
      headerName: 'Nome do Distribuidor',
      width: 250,
      flex: 1, // A coluna 'nome' vai se expandir
    },
    { field: 'city', headerName: 'Cidade', width: 200 },
    { field: 'contact', headerName: 'Contato', width: 150 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Distribuidores
      </Typography>
      <Paper sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          
          pageSizeOptions={[10, 20, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'name', sort: 'asc' }],
            },
          }}

          disableRowSelectionOnClick
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}