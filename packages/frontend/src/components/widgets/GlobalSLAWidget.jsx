import React from 'react';
import { Card, CardContent, Typography, useTheme, Box } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';

export default function GlobalSLAWidget() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SpeedIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          SLA Global Médio
        </Typography>
        <Typography variant="h4" color="textPrimary">
          2.5 Dias
        </Typography>
      </CardContent>
    </Card>
  );
}
