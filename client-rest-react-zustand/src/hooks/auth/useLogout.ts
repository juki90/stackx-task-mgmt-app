import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { routes } from '@/router';
import { resetAllSlices } from '@/store';
import { en as messages } from '@/locales';

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        resetAllSlices();
        localStorage.clear();
        navigate(routes.login);
        toast.success(messages.loggedOut);
        setTimeout(() => queryClient.clear(), 0);
    };

    return { handleLogout };
};
