import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
    const [navRef, setNavRef] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

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
        navigate,
        handleNavigationClose,
        handleNavigationClick
    };
};
