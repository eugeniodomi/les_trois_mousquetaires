import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// ALTERAÇÃO 1: Importar o novo serviço de API.
import { getProducts } from '../services/productService'; 

// ALTERAÇÃO 2: A função de simulação foi removida.

export default function ProdutosPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // ALTERAÇÃO 3: Chamar a função da API real.
        const productsFromApi = await getProducts();
        
        // ALTERAÇÃO 4: Mapear os dados da API para o formato que a DataGrid espera.
        const formattedProducts = productsFromApi.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.nome, // Backend 'nome' -> Frontend 'name'
          category: p.nome_categoria || `ID: ${p.categoria_id}`, // Usa o nome da categoria se vier do backend
          // 'stock' foi removido pois não existe no banco de dados. Veja a explicação abaixo.
        }));
        
        setRows(formattedProducts);
      } catch (error) {
        // Aqui você pode adicionar um estado de erro para mostrar na tela
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ALTERAÇÃO 5: A coluna 'stock' foi removida.
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
          disableRowSelectionOnClick
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}