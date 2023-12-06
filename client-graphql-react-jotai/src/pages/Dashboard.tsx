import { Box, Divider } from '@mui/material';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MyDashboard } from '@/components/Auth/MyDashboard';
import { PageTitleAndDescription } from '@/components/PageTitleAndDescription';

import type { FC } from 'react';

const DashboardPage: FC = () => (
    <ErrorBoundary>
        <Box height="100vh">
            <PageTitleAndDescription
                title="Dashboard"
                description="Your profile details and list of assigned tasks"
            />
            <Divider />
            <MyDashboard />
        </Box>
    </ErrorBoundary>
);

export default DashboardPage;
