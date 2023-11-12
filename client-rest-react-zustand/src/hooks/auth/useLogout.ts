import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/router';
import { resetAllSlices } from '@/store';
import { en as messages } from '@/locales';

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        resetAllSlices();

        toast.success(messages.loggedOut);

        navigate(routes.login);
    };

    return { handleLogout };
};
