// src/pages/CotacoesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// Importa a função de serviço que busca os dados reais
import { getCotacoes } from '../services/quotationService';

export default function CotacoesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCotacoes = async () => {
      try {
        setLoading(true);
        const cotacoesDaApi = await getCotacoes();

        // MAPEAMENTO DOS DADOS: "Traduzimos" os dados da API para o formato da DataGrid
        const formattedRows = cotacoesDaApi.map(cotacao => ({
          id: cotacao.id,
          status: cotacao.status,
          creationDate: new Date(cotacao.data_criacao), // Campo de data
          requester: cotacao.usuario_criador, // Nome do solicitante
          itemCount: cotacao.item_count, // Contagem de itens
        }));
        
        setRows(formattedRows);
      } catch (error) {
        console.error("Erro ao carregar cotações:", error);
        // Adicionar um estado de erro para a UI se desejar
      } finally {
        setLoading(false);
      }
    };

    loadCotacoes();
  }, []);

  const handleRowClick = (params) => {
    // A navegação para a página de detalhes continua a mesma
    navigate(`/cotacoes/${params.id}`);
  };

  // COLUNAS DEFINIDAS PELA VERSÃO "ORIGINAL" PARA MANTER O LAYOUT
  // Os 'field' foram ajustados para corresponder aos dados mapeados
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
        if (status === 'Finalizada' || status === 'Fechada') color = 'success';
        if (status === 'Cancelada') color = 'error';
        if (status === 'Em Análise') color = 'warning';
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: 'creationDate',
      headerName: 'Data de Criação',
      type: 'date',
      width: 180,
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
          onRowClick={handleRowClick}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </Box>
  );
}