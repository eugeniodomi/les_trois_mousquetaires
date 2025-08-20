import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon }) {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Box sx={{ color: 'primary.main', mr: 2 }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary">{title}</Typography>
        <Typography component="p" variant="h4">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}