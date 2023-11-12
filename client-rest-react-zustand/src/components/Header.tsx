import MenuIcon from '@mui/icons-material/Menu';
import {
    Box,
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';

import { useNavigation } from '@/hooks/useNavigation';

import { routes } from '@/router';
import { useLogout } from '@/hooks/auth/useLogout';

import type { FC } from 'react';

export const Header: FC = () => {
    const { handleLogout } = useLogout();
    const {
        navRef,
        isNavigationOpen,
        navigate,
        handleNavigationClose,
        handleNavigationClick
    } = useNavigation();

    return (
        <AppBar position="static">
            <Toolbar variant="dense">
                <Container>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="h6"
                            color="inherit"
                            component="div"
                        >
                            StackX App
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                marginLeft: 'auto',
                                alignItems: 'center'
                            }}
                        >
                            <IconButton
                                id="navigation-button"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ marginLeft: 'auto' }}
                                aria-controls={
                                    isNavigationOpen
                                        ? 'navigation-menu'
                                        : undefined
                                }
                                aria-haspopup="true"
                                aria-expanded={
                                    isNavigationOpen ? 'true' : undefined
                                }
                                onClick={handleNavigationClick}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                        <Menu
                            id="navigation-menu"
                            anchorEl={navRef}
                            open={isNavigationOpen}
                            onClose={handleNavigationClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button'
                            }}
                        >
                            <MenuItem
                                onClick={() => {
                                    navigate(routes.tasks);
                                    handleNavigationClose();
                                }}
                            >
                                Tasks
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    navigate(routes.users);
                                    handleNavigationClose();
                                }}
                            >
                                Users
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    navigate(routes.dashboard);
                                    handleNavigationClose();
                                }}
                            >
                                Dashboard
                            </MenuItem>
                            <Divider />
                            <MenuItem
                                onClick={() => {
                                    handleLogout();
                                    handleNavigationClose();
                                }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};
