import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Drawer, List, ListItem, ListItemText, IconButton, useTheme } from '@mui/material';
import RGL from 'react-grid-layout';
const ResponsiveGridLayout = RGL.Responsive || RGL.default?.Responsive || RGL;

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

// Widgets & Components
import RevenueWidget from '../components/widgets/RevenueWidget';
import PipelineWidget from '../components/widgets/PipelineWidget';
import GlobalSLAWidget from '../components/widgets/GlobalSLAWidget';
import WinRateWidget from '../components/widgets/WinRateWidget';
import PendingQuotesWidget from '../components/widgets/PendingQuotesWidget';
import RecentQuotesWidget from '../components/widgets/RecentQuotesWidget';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import { useAuth } from '../contexts/AuthContext';

const WIDGET_REGISTRY = {
  RevenueWidget: { id: 'RevenueWidget', component: RevenueWidget, name: 'Faturamento', defaultW: 4, defaultH: 2 },
  PipelineWidget: { id: 'PipelineWidget', component: PipelineWidget, name: 'Meu Funil', defaultW: 4, defaultH: 3 },
  GlobalSLAWidget: { id: 'GlobalSLAWidget', component: GlobalSLAWidget, name: 'SLA Global', defaultW: 4, defaultH: 2 },
  WinRateWidget: { id: 'WinRateWidget', component: WinRateWidget, name: 'Win Rate', defaultW: 4, defaultH: 2 },
  PendingQuotesWidget: { id: 'PendingQuotesWidget', component: PendingQuotesWidget, name: 'Pendências', defaultW: 4, defaultH: 3 },
  RecentQuotesWidget: { id: 'RecentQuotesWidget', component: RecentQuotesWidget, name: 'Cotações Recentes', defaultW: 12, defaultH: 4 },
};

const ROLE_WIDGETS = {
  Admin: ['RevenueWidget', 'GlobalSLAWidget', 'WinRateWidget', 'RecentQuotesWidget'],
  Diretor: ['RevenueWidget', 'GlobalSLAWidget', 'WinRateWidget', 'RecentQuotesWidget'],
  Vendedor: ['PendingQuotesWidget', 'PipelineWidget', 'RecentQuotesWidget'],
};

const DEFAULT_LAYOUTS = {
  Admin: [
    { i: 'RevenueWidget', x: 0, y: 0, w: 4, h: 2 },
    { i: 'GlobalSLAWidget', x: 4, y: 0, w: 4, h: 2 },
    { i: 'WinRateWidget', x: 8, y: 0, w: 4, h: 2 },
    { i: 'RecentQuotesWidget', x: 0, y: 2, w: 12, h: 4 }
  ],
  Diretor: [
    { i: 'RevenueWidget', x: 0, y: 0, w: 4, h: 2 },
    { i: 'GlobalSLAWidget', x: 4, y: 0, w: 4, h: 2 },
    { i: 'WinRateWidget', x: 8, y: 0, w: 4, h: 2 },
    { i: 'RecentQuotesWidget', x: 0, y: 2, w: 12, h: 4 }
  ],
  Vendedor: [
    { i: 'PendingQuotesWidget', x: 0, y: 0, w: 6, h: 3 },
    { i: 'PipelineWidget', x: 6, y: 0, w: 6, h: 3 },
    { i: 'RecentQuotesWidget', x: 0, y: 3, w: 12, h: 4 }
  ],
};

export default function HomePage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [layout, setLayout] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gridWidth, setGridWidth] = useState(window.innerWidth > 900 ? window.innerWidth - 280 : window.innerWidth - 40);

  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth > 900 ? window.innerWidth - 280 : window.innerWidth - 40);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = user?.cargo || 'Vendedor';
  const availableWidgets = ROLE_WIDGETS[userRole] || ROLE_WIDGETS['Vendedor'];

  useEffect(() => {
    const fetchLayout = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/usuarios/layout?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          let parsedLayout = data.layout;
          
          if (typeof parsedLayout === 'string') {
            try { parsedLayout = JSON.parse(parsedLayout); } catch (e) {}
          }
          
          if (parsedLayout && Array.isArray(parsedLayout) && parsedLayout.length > 0) {
            setLayout(parsedLayout);
          } else {
            setLayout(DEFAULT_LAYOUTS[userRole] || DEFAULT_LAYOUTS['Vendedor']);
          }
        } else {
          setLayout(DEFAULT_LAYOUTS[userRole] || DEFAULT_LAYOUTS['Vendedor']);
        }
      } catch (err) {
        console.error('Failed to load layout:', err);
        setLayout(DEFAULT_LAYOUTS[userRole] || DEFAULT_LAYOUTS['Vendedor']);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, [user, userRole]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const saveLayout = async () => {
    if (!user?.id) return;
    try {
      await fetch('/api/usuarios/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, layout })
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save layout:', err);
      alert('Erro ao salvar o layout.');
    }
  };

  const addWidget = (widgetId) => {
    const widgetConfig = WIDGET_REGISTRY[widgetId];
    const newWidget = {
      i: widgetId,
      x: (layout.length * widgetConfig.defaultW) % 12,
      y: Infinity, // Add to bottom
      w: widgetConfig.defaultW,
      h: widgetConfig.defaultH
    };
    setLayout([...layout, newWidget]);
    setIsDrawerOpen(false);
  };

  const removeWidget = (widgetId) => {
    setLayout(layout.filter(item => item.i !== widgetId));
  };

  if (loading) return <Typography>Carregando Dashboard...</Typography>;

  // Filter available widgets that are not currently in the layout
  const safeLayout = Array.isArray(layout) ? layout : [];
  const activeWidgetIds = safeLayout.map(item => item.i);
  const widgetsToAdd = availableWidgets.filter(wId => !activeWidgetIds.includes(wId));

  return (
    <Box sx={{ pb: 6 }}>
      {/* Dynamic CSS injection for placeholder visibility in Light/Dark mode */}
      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} !important;
          opacity: 1 !important;
          border-radius: 8px;
        }
      `}</style>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Bem-vindo(a), {user?.name || user?.nome || 'Visitante'}
        </Typography>
        <Box>
          {isEditing ? (
            <>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={() => setIsDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                Adicionar Widget
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />} 
                onClick={saveLayout}
              >
                Salvar Layout
              </Button>
            </>
          ) : (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={() => setIsEditing(true)}
            >
              Editar Página
            </Button>
          )}
        </Box>
      </Box>
      
      <GlobalSearchBar />

      <Box mt={3} sx={{ minHeight: '60vh' }}>
        <ResponsiveGridLayout
          className="layout"
          width={gridWidth}
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          compactType="vertical"
        >
          {safeLayout.map((item) => {
            const WidgetComponent = WIDGET_REGISTRY[item.i]?.component;
            if (!WidgetComponent) return null;
            return (
              <div key={item.i} data-grid={item}>
                <Box sx={{ height: '100%', position: 'relative' }}>
                  {isEditing && (
                    <IconButton 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        right: 4, 
                        zIndex: 10, 
                        backgroundColor: 'rgba(255,0,0,0.1)',
                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.2)' }
                      }}
                      onClick={() => removeWidget(item.i)}
                    >
                      <CloseIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                  <WidgetComponent />
                </Box>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </Box>

      {/* Widget Catalog Drawer */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Catálogo de Widgets</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Adicione os widgets permitidos para o seu cargo ({userRole}).
          </Typography>
          <List>
            {widgetsToAdd.length > 0 ? widgetsToAdd.map(wId => (
              <ListItem button key={wId} onClick={() => addWidget(wId)}>
                <ListItemText primary={WIDGET_REGISTRY[wId].name} />
                <AddIcon color="action" />
              </ListItem>
            )) : (
              <Typography variant="body2" color="textSecondary">
                Todos os widgets permitidos já estão na tela.
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}