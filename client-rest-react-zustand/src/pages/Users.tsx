import { Box, Divider, Typography } from '@mui/material';

import { UsersTable } from '@/components/Users/UsersTable';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageTitleAndDescription } from '@/components/PageTitleAndDescription';

import type { FC } from 'react';

const UsersPage: FC = () => (
    <ErrorBoundary>
        <Box height="100vh">
            <PageTitleAndDescription
                title="Users"
                description="Browse, create, update and delete regular users"
            />
            <Divider />
            <UsersTable />
        </Box>
    </ErrorBoundary>
);

export default UsersPage;
