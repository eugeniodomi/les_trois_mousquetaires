import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// ALTERAÇÃO 1: Importar o novo serviço de API.
import { getDistributors } from '../services/distributorService';

// ALTERAÇÃO 2: A função de simulação foi removida.

export default function DistribuidoresPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDistributors = async () => {
      setLoading(true);
      try {
        // ALTERAÇÃO 3: Chamar a função da API real.
        const distributorsFromApi = await getDistributors();
        
        // ALTERAÇÃO 4: Mapear os dados da API para o formato que a DataGrid espera.
        const formattedDistributors = distributorsFromApi.map(d => ({
          id: d.id,
          cnpj: d.cnpj,
          name: d.nome, // Backend 'nome' -> Frontend 'name'
          contact: d.contato_nome, // Backend 'contato_nome' -> Frontend 'contact'
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

  // ALTERAÇÃO 5: Colunas ajustadas para refletir os dados reais do banco.
  // A coluna 'city' foi removida.
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cnpj', headerName: 'CNPJ', width: 200 },
    {
      field: 'name',
      headerName: 'Nome do Distribuidor',
      width: 250,
      flex: 1,
    },
    { field: 'contact', headerName: 'Contato Principal', width: 200 },
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