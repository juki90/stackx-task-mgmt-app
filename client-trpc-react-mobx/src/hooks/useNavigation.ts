import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectFromStore } from '@/store';

export const useNavigation = () => {
    const [navRef, setNavRef] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const isLoggedUserAdmin = selectFromStore('loggedUser/isAdmin');
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
        isLoggedUserAdmin: isLoggedUserAdmin,
        navigate,
        handleNavigationClose,
        handleNavigationClick
    };
};
