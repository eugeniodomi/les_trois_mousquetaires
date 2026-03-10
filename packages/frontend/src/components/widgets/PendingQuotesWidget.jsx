import React from 'react';
import { Card, CardContent, Typography, useTheme, List, ListItem, ListItemText, Box } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

export default function PendingQuotesWidget() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentLateIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" color="textSecondary">
            Minhas Pendências
          </Typography>
        </Box>
        <List dense>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemText primary="Cotação #1042" secondary="Aguardando aprovação do cliente" />
          </ListItem>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemText primary="Cotação #1045" secondary="Pendente revisão de margem" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
