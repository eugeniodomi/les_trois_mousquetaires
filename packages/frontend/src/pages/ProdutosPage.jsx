import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { getProducts } from '../services/productService'; 

export default function ProdutosPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const productsFromApi = await getProducts();
        
        const formattedProducts = productsFromApi.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.nome,
          // O backend agora deve retornar 'nome_categoria' se a busca for otimizada com JOIN
          category: p.nome_categoria || `ID: ${p.categoria_id}`,
        }));
        
        setRows(formattedProducts);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'sku', headerName: 'SKU', width: 150 },
    {
      field: 'name',
      headerName: 'Nome do Produto',
      width: 250,
      flex: 1,
    },
    { field: 'category', headerName: 'Categoria', width: 200 },
  ];

  const handleRowClick = (params) => {
    navigate(`/produtos/${params.id}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Produtos
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
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}
