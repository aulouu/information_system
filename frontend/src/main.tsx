import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from './storage/store';

const theme = createTheme({
  palette: {
    primary: { main: '#ffffff' },
    secondary: { main: '#000000' }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)