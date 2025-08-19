// src/components/layout/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom'; // render as páginas filhas
import { Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';

import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SearchIcon from '@mui/icons-material/Search'; 


import { Link } from 'react-router-dom'; //dom


const drawerWidth = 240; // Largura do menu lateral

export default function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* BARRA SUPERIOR (HEADER) */}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Site em Progresso..
          </Typography>
        </Toolbar>
      </AppBar>

      {/* MENU LATERAL ESQUERDO (SIDEBAR) */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar /> {/* Espaçador para o conteúdo do menu não ficar atrás da AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* Item de Menu 1: Início */}
            <ListItem disablePadding>
              {/* Adicionadas as propriedades 'component' e 'to' */}
              <ListItemButton component={Link} to="/">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Início" />
              </ListItemButton>
            </ListItem>

            {/* Item de Menu 2: Busca */}
            <ListItem disablePadding>
              {/* Adicionadas as propriedades 'component' e 'to' */}
              <ListItemButton component={Link} to="/buscar">
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Buscar" />
              </ListItemButton>
            </ListItem>

            {/* Item de Menu 2: Relatórios */}
            <ListItem disablePadding>
              {/*  as propriedades 'component' e 'to' */}
              <ListItemButton component={Link} to="/relatorios">
                <ListItemIcon>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Relatórios" />
              </ListItemButton>
            </ListItem>

               {/* Adicionando os outros links como exemplo */}
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/produtos">
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Produtos" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/distribuidores">
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary="Distribuidores" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/cotacoes">
                <ListItemIcon>
                  <RequestQuoteIcon />
                </ListItemIcon>
                <ListItemText primary="Cotações" />
              </ListItemButton>
            </ListItem>

          </List>
        </Box>
      </Drawer>

      {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar /> {/* Espaçador para o conteúdo da página não ficar atrás da AppBar */}

        {/* magic! As páginas (rotas) serão renderizadas neste local. */}
        <Outlet />
      </Box>
    </Box>
  );
}