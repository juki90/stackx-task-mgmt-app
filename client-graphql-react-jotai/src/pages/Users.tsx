import { Box, Divider, Typography } from '@mui/material';

import { UsersTable } from '@/components/Users/UsersTable';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { FC } from 'react';

const UsersPage: FC = () => (
    <ErrorBoundary>
        <Box height="100vh">
            <Box
                sx={{
                    backgroundImage:
                        'repeating-linear-gradient(45deg, #acf 0, #136 100px, #acf 200px);',
                    backgroundClip: 'text',
                    marginBottom: '20px'
                }}
            >
                <Typography
                    component="h1"
                    variant="h3"
                    sx={{
                        color: 'transparent',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}
                >
                    Users
                </Typography>

                <Typography component="p" variant="h6">
                    Browse, create, update and delete regular users
                </Typography>
            </Box>
            <Divider />
            <UsersTable />
        </Box>
    </ErrorBoundary>
);

export default UsersPage;
