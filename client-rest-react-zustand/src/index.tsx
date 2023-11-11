import React, { type FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from '@/router';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient();
const theme = createTheme();

const App: FC = () => (
    <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
        <Toaster position="bottom-right" />
    </ThemeProvider>
);

root.render(
    <React.StrictMode>
        <CssBaseline />
        <App />
    </React.StrictMode>
);
