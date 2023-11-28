import React from 'react';
import { AxiosError } from 'axios';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import toast, { Toaster } from 'react-hot-toast';
import apolloClient from '@/plugins/apolloClient';
import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';

import { router, routes } from '@/router';
import { en as messages } from '@/locales';
import { resetAllSlices } from './store';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const theme = createTheme();

root.render(
    <React.StrictMode>
        <CssBaseline />
        <ThemeProvider theme={theme}>
            <ApolloProvider client={apolloClient}>
                <RouterProvider router={router} />
            </ApolloProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
    </React.StrictMode>
);
