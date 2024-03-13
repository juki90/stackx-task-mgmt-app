import dayjs from 'dayjs';
import PropTypes, { type Validator } from 'prop-types';
import { Box, Button, Drawer, styled, Typography } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import { DATE_FORMAT } from '@/config/constants';
import { FetchError } from '@/components/FetchError';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { useTaskDrawer } from '@/hooks/tasks/useTaskDrawer';

import type { ITaskDrawer, Task } from '@/types';
import type { FC, Dispatch, SetStateAction } from 'react';

export const TaskDrawer: FC<ITaskDrawer> = ({
    viewedTaskId,
    setViewedTask,
    setIsCreateOrUpdateModalOpen
}) => {
    const {
        task,
        cancelTask,
        taskToDelete,
        isTaskRefetching,
        isRefetchDisabled,
        usersStatusColumns,
        isResponseTaskFailed,
        responseTaskUpdatedAt,
        isResponseTaskSuccess,
        isResponseTaskPending,
        usersStatusWithUserInfo,
        showTaskOtherErrorMessage,
        deleteTaskOtherErrorMessage,
        setTaskToDelete,
        handleDeleteTask,
        handleCloseDrawer,
        handleRefetchTask,
        handleOpenUpdateModal,
        handleCloseDeleteDialog
    } = useTaskDrawer({
        viewedTaskId,
        setViewedTask,
        setIsCreateOrUpdateModalOpen
    });

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

    const StyledTaskContentTitle = styled(Typography)(({ theme }) => ({
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
                open={!!viewedTaskId}
                anchor="right"
                ModalProps={{
                    onBackdropClick: handleCloseDrawer
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
                {task && !isTaskRefetching && isResponseTaskSuccess ? (
                    <>
                        <Box>
                            <StyledButtonsBox
                                sx={{ display: 'flex', padding: '10px' }}
                            >
                                <StyledButton
                                    sx={{
                                        color: 'cyan',
                                        backgroundColor: 'darkcyan'
                                    }}
                                    size="medium"
                                    onClick={handleOpenUpdateModal}
                                >
                                    Edit
                                </StyledButton>
                                <StyledButton
                                    sx={{
                                        color: 'red',
                                        backgroundColor: 'darkred',
                                        marginLeft: '15px'
                                    }}
                                    size="medium"
                                    onClick={() => setTaskToDelete(task)}
                                >
                                    Delete
                                </StyledButton>
                                {task.status === 0 ? (
                                    <StyledButton
                                        sx={{
                                            color: 'red',
                                            backgroundColor: 'darkred',
                                            marginLeft: '15px'
                                        }}
                                        size="medium"
                                        onClick={() =>
                                            cancelTask?.setTaskToCancel(task)
                                        }
                                    >
                                        Cancel
                                    </StyledButton>
                                ) : null}
                                <StyledButton
                                    sx={{
                                        color: 'white',
                                        marginLeft: 'auto'
                                    }}
                                    size="medium"
                                    onClick={handleCloseDrawer}
                                >
                                    Close
                                </StyledButton>
                            </StyledButtonsBox>
                            <StyledTitleBox
                                sx={{ fontSize: '120%', padding: '10px 20px' }}
                            >
                                {task.title}
                            </StyledTitleBox>
                            <StyledTaskContentTitle>
                                Description
                            </StyledTaskContentTitle>
                            <StyledTaskContent sx={{ whiteSpace: 'pre' }}>
                                {task.description}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Status
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                {task.status === 0
                                    ? 'PENDING'
                                    : task.status === 1
                                    ? 'DONE BY EVERYONE'
                                    : 'CANCELLED'}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Created at
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                {dayjs(task.createdAt).format(DATE_FORMAT)}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Updated at
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                {dayjs(task.updatedAt).format(DATE_FORMAT)}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Created by
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                {task.createdBy
                                    ? `${task?.createdBy?.fullName} (${
                                          task.createdBy.deletedAt
                                              ? 'Deactivated'
                                              : task.createdBy.email
                                      })`
                                    : 'System'}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Updated by
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                {task.updatedBy
                                    ? `${task.updatedBy.fullName} (${
                                          task.updatedBy.deletedAt
                                              ? 'Deactivated'
                                              : task.updatedBy.email
                                      })`
                                    : '-'}
                            </StyledTaskContent>
                            <StyledTaskContentTitle>
                                Task ID
                            </StyledTaskContentTitle>
                            <StyledTaskContent>{task.id}</StyledTaskContent>
                        </Box>
                        <Box>
                            <StyledTaskContentTitle>
                                Users status
                            </StyledTaskContentTitle>
                            <StyledTaskContent>
                                You can filter users by clicking column icons.
                            </StyledTaskContent>
                            <DataGrid
                                rows={usersStatusWithUserInfo || []}
                                columns={usersStatusColumns}
                                hideFooter
                                hideFooterPagination
                                hideFooterSelectedRowCount
                                disableRowSelectionOnClick
                                autoHeight
                                sx={{
                                    margin: '0 20px',
                                    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus':
                                        {
                                            outline: 'none'
                                        },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#def'
                                    },
                                    '--DataGrid-overlayHeight': '60px'
                                }}
                                localeText={{
                                    noRowsLabel: 'No tasks at the moment'
                                }}
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    padding: '20px'
                                }}
                            >
                                <Button
                                    size="medium"
                                    endIcon={<RefreshIcon />}
                                    onClick={handleRefetchTask}
                                    disabled={isRefetchDisabled}
                                >
                                    Refresh
                                </Button>
                                <br />
                                <small
                                    style={{
                                        fontSize: '80%',
                                        marginLeft: '10px',
                                        verticalAlign: 'center !important'
                                    }}
                                >
                                    Latest check at <br />
                                    <b>
                                        {dayjs(
                                            responseTaskUpdatedAt || dayjs()
                                        ).format(DATE_FORMAT)}
                                    </b>
                                </small>
                            </Box>
                        </Box>
                        <ConfirmDialog
                            title="Delete task"
                            description={`You are about to delete task: ${taskToDelete?.title} (created by ${taskToDelete?.createdBy?.fullName}). Click CONFIRM if you are confident to do it. Tasks can't be restored`}
                            isDialogOpen={!!taskToDelete}
                            errorMessage={deleteTaskOtherErrorMessage}
                            handleConfirm={handleDeleteTask}
                            handleCloseDialog={handleCloseDeleteDialog}
                        />
                        <ConfirmDialog
                            title="Cancel task"
                            description={`You are about to CANCEL task: ${cancelTask?.taskToCancel?.title} (created by ${cancelTask?.taskToCancel?.createdBy?.fullName}). This action can't be reverted. Click CONFIRM if you are confident to do it.`}
                            isDialogOpen={!!cancelTask?.taskToCancel}
                            errorMessage={
                                cancelTask?.formError || cancelTask?.otherError
                            }
                            handleConfirm={() =>
                                cancelTask?.handleCancelTask({
                                    id: cancelTask?.taskToCancel?.id || '',
                                    status: -1
                                })
                            }
                            handleCloseDialog={
                                cancelTask?.handleCloseCancelDialog
                            }
                        />
                    </>
                ) : null}
                {isTaskRefetching || isResponseTaskPending ? (
                    <SuspenseFallback size={50} message="Showing task" center />
                ) : null}
                {isResponseTaskFailed && !isResponseTaskPending ? (
                    <FetchError
                        size={50}
                        center
                        message={
                            showTaskOtherErrorMessage ||
                            'Showing task failed. If this problem will persist, please contact administrator'
                        }
                    />
                ) : null}
            </Drawer>
        </ErrorBoundary>
    );
};

TaskDrawer.propTypes = {
    viewedTaskId: PropTypes.string,
    setViewedTask: PropTypes.func.isRequired as Validator<
        Dispatch<SetStateAction<Task | null | undefined>>
    >,
    setIsCreateOrUpdateModalOpen: PropTypes.func.isRequired as Validator<
        Dispatch<SetStateAction<boolean>>
    >
};
