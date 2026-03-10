import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function RevenueWidget() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AttachMoneyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Faturamento
        </Typography>
        <Typography variant="h4" color="textPrimary">
          R$ 1.250.000,00
        </Typography>
      </CardContent>
    </Card>
  );
}
