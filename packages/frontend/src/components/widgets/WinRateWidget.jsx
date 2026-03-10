import React from 'react';
import { Card, CardContent, Typography, useTheme, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function WinRateWidget() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Win Rate
        </Typography>
        <Typography variant="h4" color="textPrimary">
          68%
        </Typography>
      </CardContent>
    </Card>
  );
}
