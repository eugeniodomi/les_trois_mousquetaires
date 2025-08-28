import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { getDistributors } from '../services/distributorService';

export default function DistribuidoresPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDistributors = async () => {
      setLoading(true);
      try {
        const distributorsFromApi = await getDistributors();
        const formattedDistributors = distributorsFromApi.map(d => ({
          id: d.id,
          cnpj: d.cnpj,
          name: d.nome,
          contact: d.contato_nome,
        }));
        setRows(formattedDistributors);
      } catch (error) {
        console.error("Erro ao carregar distribuidores:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDistributors();
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cnpj', headerName: 'CNPJ', width: 200 },
    { field: 'name', headerName: 'Nome do Distribuidor', width: 250, flex: 1 },
    { field: 'contact', headerName: 'Contato Principal', width: 200 },
  ];

  const handleRowClick = (params) => {
    console.log("Linha clicada, a navegar para o ID:", params.id);
    navigate(`/distribuidores/${params.id}`);
  };

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
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          onRowClick={handleRowClick}
          // A propriedade sx que alterava o cursor foi removida daqui
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}
