import React from 'react';
import { AxiosError } from 'axios';
import ReactDOM from 'react-dom/client';
import toast, { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import {
    QueryClient,
    QueryCache,
    QueryClientProvider
} from '@tanstack/react-query';

import { router, routes } from '@/router';
import { en as messages } from '@/locales';
import { REACT_QUERY } from '@/config/constants';
import { resetAllSlices } from './store';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            ...REACT_QUERY
        }
    },
    queryCache: new QueryCache({
        onError: error => {
            if (
                error instanceof AxiosError &&
                error?.response?.status === 401
            ) {
                toast.error(messages.loginSessionExpired);
                queryClient.clear();
                resetAllSlices();
                localStorage.clear();
                router.navigate(routes.login);
            }
        }
    })
});

const theme = createTheme();

root.render(
    <React.StrictMode>
        <CssBaseline />
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
    </React.StrictMode>
);
