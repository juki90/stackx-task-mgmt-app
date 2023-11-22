import { Box, Divider, Typography } from '@mui/material';

import { TasksTable } from '@/components/Tasks/TasksTable';
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
                    Tasks
                </Typography>

                <Typography component="p" variant="h6">
                    Browse, create, update and delete tasks. Tasks are
                    assignable to every user in the system. They can be marked
                    as done and will be listed as done by particular user. Each
                    task can be also cancelled.
                </Typography>
            </Box>
            <Divider />
            <TasksTable />
        </Box>
    </ErrorBoundary>
);

export default UsersPage;
