import { ReactNode, Suspense, lazy } from 'react';
import { jwtDecode as decodeJwt } from 'jwt-decode';
import { redirect, createBrowserRouter } from 'react-router-dom';

import { ROLES } from '@/config/constants';
import { AuthenticatedLayout } from '@/layouts/Authenticated';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import { SuspenseFallback } from '@/components/SuspenseFallback';

import type { User } from '@/types';

export const routes = {
    root: '/',
    login: '/login',
    users: '/users',
    tasks: '/tasks',
    dashboard: '/dashboard'
};

const loadOrRedirect = (role: string) => () => {
    let loggedUser;
    const access_token = localStorage.getItem('access_token');

    try {
        loggedUser = decodeJwt(access_token || 'null') as User | undefined;
    } catch (error) {
        console.error(error);
    }

    if (role === 'guest') {
        if (loggedUser) {
            return redirect(routes.dashboard);
        }

        return null;
    }

    if (role === 'authenticated' && loggedUser) {
        return null;
    }

    const loggedUserRole = loggedUser?.role?.name;

    if (loggedUserRole && loggedUserRole !== role) {
        return redirect(routes.dashboard);
    }

    if (!loggedUser) {
        return redirect(routes.login);
    }

    return null;
};

const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));

const PageWithSuspenseAndErrorBoundary = (element: ReactNode) => (
    <PageErrorBoundary>
        <Suspense
            fallback={
                <SuspenseFallback center size={75} message="Loading page" />
            }
        >
            {element}
        </Suspense>
    </PageErrorBoundary>
);

export const router = createBrowserRouter([
    {
        path: routes.login,
        element: PageWithSuspenseAndErrorBoundary(<LoginPage />),
        loader: loadOrRedirect('guest')
    },
    {
        path: routes.root,
        element: <AuthenticatedLayout />,
        children: [
            {
                index: true,
                loader: loadOrRedirect('redirect-everyone')
            }
        ]
    },
    {
        path: routes.dashboard,
        element: <AuthenticatedLayout />,
        children: [
            {
                index: true,
                element: PageWithSuspenseAndErrorBoundary(<DashboardPage />),
                loader: loadOrRedirect('authenticated')
            }
        ]
    },
    {
        path: routes.users,
        element: <AuthenticatedLayout />,
        children: [
            {
                index: true,
                element: <div>DefaultPAGE</div>,
                loader: loadOrRedirect(ROLES.ADMIN)
            }
        ]
    },
    {
        path: routes.tasks,
        element: <AuthenticatedLayout />,
        children: [
            {
                index: true,
                element: <div>DefaultPAGE</div>,
                loader: loadOrRedirect(ROLES.ADMIN)
            }
        ]
    }
]);
