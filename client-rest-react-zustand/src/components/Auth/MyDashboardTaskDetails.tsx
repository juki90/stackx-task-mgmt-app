import dayjs from 'dayjs';
import PropTypes, { type Validator } from 'prop-types';
import { Box, Button, Drawer, styled, Typography } from '@mui/material';

import { DATE_FORMAT } from '@/config/constants';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { FC, Dispatch, SetStateAction } from 'react';
import type { Task, IMyDashboardTaskDetails } from '@/types';

export const MyDashboardTaskDetails: FC<IMyDashboardTaskDetails> = ({
    task,
    setTask
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
                            <StyledButton
                                sx={{
                                    color: 'lightgreen',
                                    backgroundColor: 'green'
                                }}
                                size="medium"
                            >
                                Mark as done
                            </StyledButton>
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
                        <StyledTaskContent>
                            {task.description}
                        </StyledTaskContent>
                        <StyledUserContentTitle>
                            Users assigned / finished by
                        </StyledUserContentTitle>
                        <StyledTaskContent>
                            {
                                task.usersStatus.filter(
                                    ({
                                        doneAt
                                    }: {
                                        userId: string;
                                        doneAt: string;
                                    }) => doneAt
                                ).length
                            }
                            /{task.usersStatus.length}
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
