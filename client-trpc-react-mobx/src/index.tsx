import superjson from 'superjson';
import React, { type FC } from 'react';
import { httpLink } from '@trpc/client';
import ReactDOM from 'react-dom/client';
import toast, { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { trpc } from '@/plugins/trpc';
import { resetAllSlices } from '@/store';
import { router, routes } from '@/router';
import { en as messages } from '@/locales';
import { REACT_QUERY } from '@/config/constants';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            ...REACT_QUERY
        }
    }
});

const trpcClient = trpc.createClient({
    links: [
        httpLink({
            url:
                process.env.REACT_APP_SERVER_API_URL ||
                `${window.location.protocol}//${window.location.host}/trpc`,

            headers() {
                const access_token = localStorage.getItem('access_token');

                if (!access_token) {
                    return {};
                }

                const jwtHeader = `Bearer ${access_token}`;

                return {
                    Authorization: jwtHeader
                };
            },
            fetch: async (
                url: string | URL | Request,
                options?: RequestInit | undefined
            ): Promise<Response> => {
                const res = await fetch(url, options);

                const responseStatus = res?.status;

                if (responseStatus === 401) {
                    resetAllSlices();
                    localStorage.clear();
                    queryClient.clear();
                    window.location.href = routes.login;
                }

                if (responseStatus === 403) {
                    toast.error(messages.redirectBecauseOfForbiddenAction);
                    window.location.href = routes.dashboard;
                }

                const jwtHeader = res?.headers?.get('x-auth-token');

                const tokenMatch = /Bearer (\S+)/g.exec(jwtHeader || '');

                if (!tokenMatch || tokenMatch.length < 1) {
                    return res;
                }

                const [, token] = tokenMatch;

                if (token) {
                    localStorage.setItem('access_token', token);
                }

                return res;
            }
        })
    ],
    transformer: superjson
});

const App: FC = () => {
    const theme = createTheme();

    return (
        <>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <trpc.Provider client={trpcClient} queryClient={queryClient}>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </trpc.Provider>
            </ThemeProvider>

            <Toaster
                position="bottom-right"
                toastOptions={{ duration: 5000 }}
            />
        </>
    );
};

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
