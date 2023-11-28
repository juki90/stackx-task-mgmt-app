import { Box, Divider, Typography } from '@mui/material';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MyDashboard } from '@/components/Auth/MyDashboard';

import type { FC } from 'react';

const DashboardPage: FC = () => (
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
                    Dashboard
                </Typography>
                <Typography component="p" variant="h6">
                    Your profile details and list of assigned tasks
                </Typography>
            </Box>
            <Divider />
            <MyDashboard />
        </Box>
    </ErrorBoundary>
);

export default DashboardPage;
