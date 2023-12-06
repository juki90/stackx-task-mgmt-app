import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { purple } from '@mui/material/colors';
import { ApolloProvider } from '@apollo/client';
import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';

import { Provider } from 'jotai';
import { router } from '@/router';
import apolloClient from '@/plugins/apolloClient';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const theme = createTheme({ palette: { primary: { main: purple[500] } } });

root.render(
    <React.StrictMode>
        <CssBaseline />
        <ThemeProvider theme={theme}>
            <Provider>
                <ApolloProvider client={apolloClient}>
                    <RouterProvider router={router} />
                </ApolloProvider>
            </Provider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
    </React.StrictMode>
);
