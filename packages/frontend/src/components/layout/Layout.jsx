import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Drawer as MuiDrawer, AppBar as MuiAppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, CssBaseline, Collapse } from '@mui/material';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Ícone para Cotações

const drawerWidth = 240;

// ... (Componentes AppBar e Drawer - Nenhuma alteração aqui)
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);


export default function Layout() {
  const [open, setOpen] = useState(true);
  const [registrosOpen, setRegistrosOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleRegistrosClick = () => {
    setRegistrosOpen(!registrosOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="absolute" open={open}>
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Site em Progresso..
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <List component="nav">
          {/* Itens principais do menu */}
          <ListItemButton component={Link} to="/">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Início" />
          </ListItemButton>
          <ListItemButton component={Link} to="/buscar">
            <ListItemIcon><SearchIcon /></ListItemIcon>
            <ListItemText primary="Buscar" />
          </ListItemButton>
          <ListItemButton component={Link} to="/dashboards">
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Dashboards" />
          </ListItemButton>

          {/* ITEM DE MENU "REGISTROS" */}
          <ListItemButton onClick={handleRegistrosClick}>
            <ListItemIcon>
              <AppRegistrationIcon />
            </ListItemIcon>
            <ListItemText primary="Registros" />
            {registrosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          {/* SUB-MENU QUE APARECE E DESAPARECE */}
          <Collapse in={registrosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Item "Produtos" aninhado */}
              <ListItemButton component={Link} to="/produtos" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Produtos" />
              </ListItemButton>
              {/* Item "Distribuidores" aninhado */}
              <ListItemButton component={Link} to="/distribuidores" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary="Distribuidores" />
              </ListItemButton>
              {/* ===== ADAPTAÇÃO AQUI ===== */}
              <ListItemButton component={Link} to="/cotacoes" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <RequestQuoteIcon />
                </ListItemIcon>
                <ListItemText primary="Cotações" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}