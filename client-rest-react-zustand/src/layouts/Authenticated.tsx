import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import { Header } from '@/components/Header';

import type { FC } from 'react';

export const AuthenticatedLayout: FC = () => (
    <Box>
        <Header />
        <Container>
            <Outlet />
        </Container>
    </Box>
);
