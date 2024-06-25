import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootStore } from '@/context/RootStore';

export const useNavigation = () => {
    const { authStore } = useContext(RootStore);
    const [navRef, setNavRef] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const { isLoggedUserAdmin } = authStore;
    const isNavigationOpen = Boolean(navRef);

    const handleNavigationClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setNavRef(event.currentTarget);
    };

    const handleNavigationClose = () => {
        setNavRef(null);
    };

    return {
        navRef,
        isNavigationOpen,
        isLoggedUserAdmin,
        navigate,
        handleNavigationClose,
        handleNavigationClick
    };
};
