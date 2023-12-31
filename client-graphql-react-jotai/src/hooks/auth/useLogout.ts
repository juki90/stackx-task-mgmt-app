import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/router';
import { en as messages } from '@/locales';
import apolloClient from '@/plugins/apolloClient';

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        toast.success(messages.loggedOut);
        navigate(routes.login);
        setTimeout(() => apolloClient.clearStore(), 0);
    };

    return { handleLogout };
};
