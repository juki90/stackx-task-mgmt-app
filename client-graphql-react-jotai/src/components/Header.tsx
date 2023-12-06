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
        isLoggedUserAdmin,
        navigate,
        handleNavigationClose,
        handleNavigationClick
    } = useNavigation();

    return (
        <AppBar position="fixed">
            <Toolbar variant="dense">
                <Container>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '2em'
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="inherit"
                            component="div"
                        >
                            StackX
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
                            {isLoggedUserAdmin ? (
                                <Box>
                                    <MenuItem
                                        onClick={() => {
                                            handleNavigationClose();
                                            navigate(routes.tasks);
                                        }}
                                    >
                                        Tasks
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleNavigationClose();
                                            navigate(routes.users);
                                        }}
                                    >
                                        Users
                                    </MenuItem>
                                </Box>
                            ) : null}
                            <MenuItem
                                onClick={() => {
                                    handleNavigationClose();
                                    navigate(routes.dashboard);
                                }}
                            >
                                Dashboard
                            </MenuItem>
                            <Divider />
                            <MenuItem
                                onClick={() => {
                                    handleNavigationClose();
                                    handleLogout();
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
