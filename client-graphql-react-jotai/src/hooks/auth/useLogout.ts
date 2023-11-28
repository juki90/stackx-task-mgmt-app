import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/router';
import { resetAllSlices } from '@/store';
import { en as messages } from '@/locales';
import apolloClient from '@/plugins/apolloClient';

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        resetAllSlices();
        toast.success(messages.loggedOut);
        navigate(routes.login);
        setTimeout(() => apolloClient.clearStore(), 0);
    };

    return { handleLogout };
};
