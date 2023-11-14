import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import { Header } from '@/components/Header';

import type { FC } from 'react';

export const AuthenticatedLayout: FC = () => (
    <Box sx={{ marginTop: '5em', padding: '0 10px 0 10px' }}>
        <Header />
        <Container>
            <Outlet />
        </Container>
    </Box>
);
