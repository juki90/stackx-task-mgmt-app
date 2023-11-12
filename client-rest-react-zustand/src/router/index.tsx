import { redirect, createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '@/pages/Login';
import { ROLES } from '@/config/constants';
import { AuthenticatedLayout } from '@/layouts/Authenticated';

export const routes = {
    root: '/',
    login: '/login',
    users: '/users',
    tasks: '/tasks',
    dashboard: '/dashboard'
};

const loadOrRedirect = (role: string) => () => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

    if (role === 'guest') {
        if (loggedUser) {
            return redirect(routes.dashboard);
        }

        return null;
    }

    if (role === 'authenticated' && loggedUser) {
        return null;
    }

    if (loggedUser?.role?.name !== role) {
        return redirect(routes.dashboard);
    }

    if (!loggedUser) {
        return redirect(routes.login);
    }

    return null;
};

export const router = createBrowserRouter([
    {
        path: routes.login,
        element: <LoginPage />,
        loader: loadOrRedirect('guest')
    },
    {
        path: routes.root,
        element: <AuthenticatedLayout />,
        children: [
            {
                index: true,
                element: <div>DefaultPAGE</div>,
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
                element: <div>DefaultPAGE</div>,
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
