import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

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

        const formattedRows = cotacoesDaApi.map(cotacao => ({
          id: cotacao.id,
          descricao: cotacao.descricao, // <<< DESCRIÇÃO ADICIONADA AO MAPEAMENTO
          status: cotacao.status,
          creationDate: new Date(cotacao.data_criacao),
          requester: cotacao.usuario_criador_nome || 'N/A', // <<< Usando o nome do usuário que vem do JOIN
          itemCount: cotacao.item_count || 0,
          distribuidores: cotacao.distribuidores_nomes || [], // <<< DISTRIBUIDORES ADICIONADOS AO MAPEAMENTO
        }));
        
        setRows(formattedRows);
      } catch (error) {
        console.error("Erro ao carregar cotações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCotacoes();
  }, []);

  const handleRowClick = (params) => {
    navigate(`/cotacoes/${params.id}`);
  };

    const columns = [
    { field: 'id', headerName: 'ID Cotação', width: 120 },
    {
      field: 'descricao',
      headerName: 'Descrição',
      width: 250,
      flex: 1,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        if (status === 'Aberta') color = 'primary';
        if (status === 'Fechada') color = 'success';
        if (status === 'Cancelada') color = 'error';
        if (status === 'Em Análise' || status === 'Aguardando Aprovação') color = 'warning';
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: 'distribuidores',
      headerName: 'Distribuidores',
      width: 220,
      flex: 1,
      renderCell: (params) => {
        const nomes = params.value.join(', ');
        return (
          <Typography variant="body2" noWrap title={nomes}>
            {nomes || 'N/A'}
          </Typography>
        );
      },
      // <<< ADIÇÃO DA FUNÇÃO DE ORDENAÇÃO PERSONALIZADA
      sortComparator: (v1, v2) => {
        // v1 e v2 são os arrays de nomes de distribuidores (ex: ['Nome A', 'Nome B'])
        // Juntamos os nomes em uma string para poder comparar
        const textV1 = v1.join(', ');
        const textV2 = v2.join(', ');
        // Usamos localeCompare para uma ordenação alfabética correta
        return textV1.localeCompare(textV2);
      },
    },
    {
      field: 'creationDate',
      headerName: 'Data de Criação',
      type: 'dateTime',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString('pt-BR'),
    },
    { field: 'requester', headerName: 'Solicitante', width: 200 },
    { field: 'itemCount', headerName: 'Nº de Itens', type: 'number', width: 110 },
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