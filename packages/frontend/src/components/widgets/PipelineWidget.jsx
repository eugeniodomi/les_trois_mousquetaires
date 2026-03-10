import React from 'react';
import { Card, CardContent, Typography, useTheme, Box } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';

export default function PipelineWidget() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimelineIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="textSecondary">
            Meu Funil (Pipeline)
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Propostas Enviadas: 15
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Em Negociação: 8
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Fechadas (Mês): 3
        </Typography>
      </CardContent>
    </Card>
  );
}
