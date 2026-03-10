import React from 'react';
import { Card, CardContent, Typography, useTheme, Box } from '@mui/material';
import QuoteList from '../dashboard/QuoteList';
import ArticleIcon from '@mui/icons-material/Article';

// Assuming we pass data in or mock it for now.
export default function RecentQuotesWidget({ data }) {
  const theme = useTheme();

  const dummyQuotes = [
    { id: 1, name: 'Cotação Alpha', distributor: 'Empresa A', date: '10/03/2026', status: 'Em Análise' },
    { id: 2, name: 'Cotação Beta', distributor: 'Empresa B', date: '09/03/2026', status: 'Aprovada' },
    { id: 3, name: 'Cotação Gama', distributor: 'Empresa C', date: '08/03/2026', status: 'Pendente' }
  ];

  const quotesToDisplay = data || dummyQuotes;

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ArticleIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="textSecondary">
            Cotações Recentes
          </Typography>
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <QuoteList title="" quotes={quotesToDisplay} />
        </Box>
      </CardContent>
    </Card>
  );
}
