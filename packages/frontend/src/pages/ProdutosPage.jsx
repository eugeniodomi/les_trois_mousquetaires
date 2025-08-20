import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// --- SIMULAÇÃO DE DADOS DO BANCO ---
const fetchProductsFromDB = async () => {
  console.log("Buscando produtos no 'banco de dados'...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockProducts = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    sku: `SKU-${1000 + index}`,
    name: `Produto ${String.fromCharCode(65 + (index % 26))}${index}`,
    category: `Categoria ${Math.ceil((index + 1) / 10)}`,
    stock: Math.floor(Math.random() * 100),
  }));

  return mockProducts;
};

export default function ProdutosPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const products = await fetchProductsFromDB();
      setRows(products);
      setLoading(false);
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
    { field: 'stock', headerName: 'Qtd. de Vendas', type: 'number', width: 140 },
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
          
          // ===== MODIFICAÇÃO AQUI =====
          pageSizeOptions={[10, 20, 50, 100]} // Opções que o usuário pode escolher
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }, // Quantidade de itens por página inicial
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