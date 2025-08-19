// src/components/layout/Layout.jsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Drawer as MuiDrawer, AppBar as MuiAppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SearchIcon from '@mui/icons-material/Search';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    // ANIMAÇÃO MAIS SUAVE
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard, // Aumente a duração
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      // ANIMAÇÃO MAIS SUAVE
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard, // Aumente a duração
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
        // ANIMAÇÃO MAIS SUAVE
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          // ANIMAÇÃO MAIS SUAVE
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.standard,
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
  const [open, setOpen] = React.useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute" open={open}>
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              marginRight: '36px',
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
        <Toolbar /> 
        <List component="nav">
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} to="/" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><HomeIcon /></ListItemIcon>
                <ListItemText primary="Início" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} to="/buscar" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><SearchIcon /></ListItemIcon>
                <ListItemText primary="Buscar" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            {/* Repita o padrão para os outros itens */}
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={Link} to="/relatorios" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><BarChartIcon /></ListItemIcon>
                    <ListItemText primary="Relatórios" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={Link} to="/produtos" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><InventoryIcon /></ListItemIcon>
                    <ListItemText primary="Produtos" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={Link} to="/distribuidores" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><GroupIcon /></ListItemIcon>
                    <ListItemText primary="Distribuidores" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={Link} to="/cotacoes" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}><RequestQuoteIcon /></ListItemIcon>
                    <ListItemText primary="Cotações" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
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