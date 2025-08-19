// src/pages/HomePage.jsx

import React from 'react';
import { Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <Box>
      <Typography variant="h4">
        Bem-vindo à Página Inicial
      </Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        Este é o conteúdo da sua página inicial. Breve, dashboards aqui.
      </Typography>
    </Box>
  );
}