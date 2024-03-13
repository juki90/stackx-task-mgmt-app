import { Box, Divider } from '@mui/material';

import { TasksTable } from '@/components/Tasks/TasksTable';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageTitleAndDescription } from '@/components/PageTitleAndDescription';

import type { FC } from 'react';

const UsersPage: FC = () => (
    <ErrorBoundary>
        <Box height="100vh">
            <PageTitleAndDescription
                title="Tasks"
                description="Browse, create, update and delete tasks. Tasks are
                assignable to every user in the system. They can be marked
                as done and will be listed as done by particular user. Each
                task can be also cancelled"
            />
            <Divider />
            <TasksTable />
        </Box>
    </ErrorBoundary>
);

export default UsersPage;
