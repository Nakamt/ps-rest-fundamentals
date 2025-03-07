import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
//coloquei pra ver se a URL ta certa no .env, ta dando um erro aqui mesmo dps de colocar o CORS, e n sei oq fazer, to utilizando do chat + github