import dayjs from 'dayjs';
import PropTypes, { type Validator } from 'prop-types';
import { Box, Button, Drawer, styled, Typography } from '@mui/material';

import { DATE_FORMAT } from '@/config/constants';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { FC, Dispatch, SetStateAction } from 'react';
import type { Task, IMyDashboardTaskDetails } from '@/types';

export const MyDashboardTaskDetails: FC<IMyDashboardTaskDetails> = ({
    task,
    formError,
    otherError,
    taskToMarkAsDone,
    setTask,
    setTaskToMarkAsDone,
    handleMarkTaskAsDone,
    handleCloseMarkAsDoneDialog
}) => {
    const StyledButtonsBox = styled(Typography)(({ theme }) => ({
        display: 'flex',
        fontWeight: 'bold',
        backgroundColor: theme.palette.primary.dark
    }));

    const StyledTitleBox = styled(Typography)(({ theme }) => ({
        display: 'flex',
        fontWeight: 'bold',
        color: theme.palette.getContrastText(theme.palette.primary.dark),
        backgroundColor: theme.palette.primary.light
    }));

    const StyledUserContentTitle = styled(Typography)(({ theme }) => ({
        fontWeight: 'bold',
        padding: '5px 20px',
        backgroundColor: theme.palette.grey[300]
    }));

    const StyledTaskContent = styled(Typography)(() => ({
        padding: '10px 20px'
    }));

    const StyledButton = styled(Button)(() => ({
        border: '1px solid',
        lineHeight: '100%'
    }));

    return (
        <ErrorBoundary>
            <Drawer
                open={!!task}
                anchor="right"
                ModalProps={{
                    onBackdropClick: () => setTask(null)
                }}
                PaperProps={{
                    sx: {
                        width: '90% !important',
                        '@media (min-width: 900px)': {
                            width: '768px !important'
                        }
                    }
                }}
            >
                {task ? (
                    <Box>
                        <StyledButtonsBox
                            sx={{ display: 'flex', padding: '10px' }}
                        >
                            {task.status === 0 ? (
                                <StyledButton
                                    sx={{
                                        color: 'lightgreen',
                                        backgroundColor: 'green'
                                    }}
                                    size="medium"
                                    onClick={() => setTaskToMarkAsDone(task)}
                                >
                                    Mark as done
                                </StyledButton>
                            ) : null}
                            <StyledButton
                                sx={{
                                    color: 'white',
                                    marginLeft: 'auto'
                                }}
                                size="medium"
                                onClick={() => setTask(null)}
                            >
                                Close
                            </StyledButton>
                        </StyledButtonsBox>
                        <StyledTitleBox>
                            <StyledTaskContent sx={{ fontSize: '120%' }}>
                                {task.title}
                            </StyledTaskContent>
                        </StyledTitleBox>
                        <StyledUserContentTitle>
                            Description
                        </StyledUserContentTitle>
                        <StyledTaskContent sx={{ whiteSpace: 'pre' }}>
                            {task.description}
                        </StyledTaskContent>
                        <StyledUserContentTitle>Status</StyledUserContentTitle>
                        <StyledTaskContent>
                            {task.status === 0
                                ? 'PENDING'
                                : task.status === 1
                                ? 'DONE'
                                : 'CANCELLED'}
                        </StyledTaskContent>
                        <StyledUserContentTitle>
                            Users assigned / finished by
                        </StyledUserContentTitle>
                        <StyledTaskContent>
                            {
                                task.usersStatus?.filter(
                                    ({
                                        doneAt
                                    }: {
                                        userId: string;
                                        doneAt: string;
                                    }) => doneAt
                                ).length
                            }
                            /{task.usersStatus?.length}
                        </StyledTaskContent>
                        <StyledUserContentTitle>
                            Created at
                        </StyledUserContentTitle>
                        <StyledTaskContent>
                            {dayjs(task.createdAt).format(DATE_FORMAT)}
                        </StyledTaskContent>
                        <StyledUserContentTitle>
                            Updated at
                        </StyledUserContentTitle>
                        <StyledTaskContent>
                            {dayjs(task.updatedAt).format(DATE_FORMAT)}
                        </StyledTaskContent>
                        <StyledUserContentTitle>Task ID</StyledUserContentTitle>
                        <StyledTaskContent>{task.id}</StyledTaskContent>
                    </Box>
                ) : null}
                <ConfirmDialog
                    title="Mark task as  done"
                    description={`You are about to mark this task (${task?.title}) as done. This action is irreversible. Press CONFIRM to mark it as done.`}
                    isDialogOpen={!!taskToMarkAsDone}
                    errorMessage={formError || otherError}
                    handleCloseDialog={handleCloseMarkAsDoneDialog}
                    handleConfirm={() =>
                        handleMarkTaskAsDone({
                            id: taskToMarkAsDone?.id || '',
                            status: 1
                        })
                    }
                />
            </Drawer>
        </ErrorBoundary>
    );
};

MyDashboardTaskDetails.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.number.isRequired,
        usersStatus: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.string.isRequired,
                doneAt: PropTypes.string
            })
        ).isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
        createdBy: PropTypes.object,
        updatedBy: PropTypes.object,
        createdById: PropTypes.string.isRequired,
        updatedById: PropTypes.string,
        users: PropTypes.arrayOf(PropTypes.object)
    }) as Validator<Task | null>,
    setTask: PropTypes.func.isRequired as Validator<
        Dispatch<SetStateAction<Task | null>>
    >
};
