import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';

import { loggedUserIsAdminAtom } from '@/atoms/auth';

export const useNavigation = () => {
    const [navRef, setNavRef] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const isLoggedUserAdmin = useAtomValue(loggedUserIsAdminAtom);
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
