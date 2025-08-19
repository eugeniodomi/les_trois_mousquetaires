// src/App.jsx

// Importe os componentes que você quer usar do MUI
import { Typography, Button, Box } from '@mui/material';

function App() {
  return (
    // Box é um componente do MUI que funciona como uma <div>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2, // Adiciona um espaçamento de 16px (2 * 8px) entre os itens
      }}
    >
      <Typography variant="h4" component="h1">
        Teste do Tema MUI
      </Typography>

      <Typography>
        Se o tema estiver funcionando, os botões abaixo terão as cores que definimos.
      </Typography>

      {/* Este botão irá automaticamente usar a cor 'primary.main' do seu tema */}
      <Button variant="contained" color="primary">
        Botão Primário (Azul)
      </Button>

      {/* Este botão irá automaticamente usar a cor 'secondary.main' do seu tema */}
      <Button variant="contained" color="secondary">
        Botão Secundário (Rosa)
      </Button>
    </Box>
  );
}

export default App;