import React, { useState, useMemo, createContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light Palette
                primary: {
                  main: '#111E2A', // Biz Blue
                },
                secondary: {
                  main: '#2C6CED', // One Blue
                },
                background: {
                  default: '#FFFFFF',
                  paper: '#FFFFFF',
                },
              }
            : {
                // Dark Palette
                primary: {
                  main: '#A4E9FF', // Tech Blue
                },
                secondary: {
                  main: '#2C6CED', // One Blue
                },
                background: {
                  default: '#0A1118', // Deep Dark Blue
                  paper: '#111E2A', // Biz Blue context for paper/sidebar
                },
                text: {
                  primary: '#FFFFFF',
                  secondary: '#B0BEC5', // Slightly muted text for less emphasis
                },
              }),
        },
        typography: {
          fontFamily: '"Onest", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
          h2: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
          h3: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
          h4: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
          h5: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
          h6: { fontFamily: '"ABC Oracle Plus", "Outfit", "Montserrat", sans-serif' },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              .recharts-text, .recharts-cartesian-axis-tick-value {
                fill: ${mode === 'light' ? '#111E2A' : '#FFFFFF'} !important;
              }
              .recharts-default-tooltip {
                background-color: ${mode === 'light' ? '#FFFFFF' : '#111E2A'} !important;
                border-color: ${mode === 'light' ? '#E0E0E0' : '#455A64'} !important;
              }
              .recharts-tooltip-item {
                color: ${mode === 'light' ? '#111E2A' : '#FFFFFF'} !important;
              }
            `,
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
