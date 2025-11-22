import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ColorModeScript } from '@chakra-ui/react';
import './index.css';
import App from './App.jsx';
import './i18n';
import theme from './theme';
import { AppThemeProvider } from './context/AppThemeProvider';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppThemeProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </AppThemeProvider>
  </BrowserRouter>
);
   