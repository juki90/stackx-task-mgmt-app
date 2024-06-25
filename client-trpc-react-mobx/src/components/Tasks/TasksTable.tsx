import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Typography, TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { DATE_FORMAT } from '@/config/constants';
import { FetchError } from '@/components/FetchError';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TaskDrawer } from '@/components/Tasks/TaskDrawer';
import { useTasksTable } from '@/hooks/tasks/useTasksTable';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { CreateOrUpdateTask } from '@/components/Tasks/CreateOrUpdateTask';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';

import type { FC } from 'react';

export const TasksTable: FC = observer(() => {
    const {
        tasks,
        viewedTask,
        pagination,
        tasksFilter,
        tasksColumns,
        isTasksRefetching,
        userPickerUserList,
        isRefetchDisabled,
        isResponseTasksFailed,
        responseTasksUpdatedAt,
        isResponseTasksPending,
        isResponseTasksSuccess,
        isCreateOrUpdateModalOpen,
        setTasksPage,
        setViewedTask,
        setTasksFilter,
        handleRefetchTasks,
        setUserPickerUserList,
        setIsCreateOrUpdateModalOpen
    } = useTasksTable();

    return (
        <ErrorBoundary>
            <Box sx={{ margin: '20px 0' }}>
                <>
                    <Typography
                        component="h2"
                        variant="h5"
                        sx={{ marginBottom: '20px' }}
                    >
                        Tasks table
                    </Typography>
                    <Typography
                        component="p"
                        variant="body1"
                        sx={{ marginBottom: '30px' }}
                    >
                        The table shows all tasks in the system.
                    </Typography>
                    <Box
                        sx={{
                            marginBottom: '10px',
                            '@media (min-width: 900px)': {
                                display: 'flex',
                                alignItems: 'flex-end'
                            }
                        }}
                    >
                        <TextField
                            label="Filter"
                            fullWidth
                            size="small"
                            placeholder="Filter tasks by names and emails"
                            inputProps={{
                                value: tasksFilter,
                                onChange: async e =>
                                    setTasksFilter(
                                        (e.target as HTMLInputElement).value
                                    )
                            }}
                        />
                        <Box
                            sx={{
                                display: 'block',
                                marginTop: '10px',
                                maxWidth: '600px',
                                '@media (min-width: 900px)': {
                                    display: 'flex',
                                    justifyContent: 'right',
                                    alignItem: 'center',
                                    marginLeft: 'auto'
                                }
                            }}
                        >
                            <Button
                                color="primary"
                                endIcon={<AddCircleOutlineIcon />}
                                sx={{
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    padding: '10px',
                                    '@media (min-width: 900px)': {
                                        margin: '0 15px'
                                    }
                                }}
                                onClick={() =>
                                    setIsCreateOrUpdateModalOpen(true)
                                }
                            >
                                Create&nbsp;Task
                            </Button>
                            <Box
                                sx={{
                                    textAlign: 'left',
                                    display: 'flex',
                                    '@media (min-width: 900px)': {
                                        display: 'flex'
                                    }
                                }}
                            >
                                <Button
                                    size="medium"
                                    endIcon={<RefreshIcon />}
                                    onClick={handleRefetchTasks}
                                    disabled={isRefetchDisabled}
                                    sx={{ padding: '0 10px' }}
                                >
                                    Refresh
                                </Button>
                                <br />
                                <small
                                    style={{
                                        display: 'block',
                                        width: '200px',
                                        fontSize: '80%',
                                        marginLeft: '10px'
                                    }}
                                >
                                    Latest check at <br />
                                    <b>
                                        {dayjs(
                                            responseTasksUpdatedAt || dayjs()
                                        ).format(DATE_FORMAT)}
                                    </b>
                                </small>
                            </Box>
                        </Box>
                    </Box>
                    {isResponseTasksSuccess && !isTasksRefetching ? (
                        <DataGrid
                            rows={tasks || []}
                            columns={tasksColumns}
                            hideFooterSelectedRowCount
                            disableColumnMenu
                            disableColumnFilter
                            disableColumnSelector
                            disableDensitySelector
                            sortingMode="server"
                            paginationMode="server"
                            autoHeight
                            localeText={{
                                noRowsLabel: 'No tasks'
                            }}
                            sx={{
                                cursor: 'pointer !important',
                                borderCollapse: 'collapse',
                                '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus,  & .MuiDataGrid-columnHeader:focus,  & .MuiDataGrid-columnHeader:focus':
                                    {
                                        outline: 'none'
                                    },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#dfe'
                                },
                                '& .MuiDataGrid-iconButtonContainer': {
                                    display: 'none'
                                },
                                '--DataGrid-overlayHeight': '60px'
                            }}
                            rowCount={pagination.total}
                            pageSizeOptions={[5, 10, 25, 50]}
                            paginationModel={{
                                pageSize: pagination.size,
                                page: pagination.index
                            }}
                            onPaginationModelChange={({ pageSize, page }) =>
                                setTasksPage({ size: pageSize, index: page })
                            }
                            onRowClick={({ row }) => setViewedTask(row)}
                        />
                    ) : null}
                    <UserPickerUsersListContext.Provider
                        value={{
                            userList: userPickerUserList,
                            setUserList: setUserPickerUserList
                        }}
                    >
                        <TaskDrawer
                            viewedTaskId={viewedTask?.id}
                            setViewedTask={setViewedTask}
                            setIsCreateOrUpdateModalOpen={
                                setIsCreateOrUpdateModalOpen
                            }
                        />
                        <CreateOrUpdateTask
                            task={viewedTask}
                            isModalOpen={isCreateOrUpdateModalOpen}
                            setIsCreateOrUpdateModalOpen={
                                setIsCreateOrUpdateModalOpen
                            }
                        />
                    </UserPickerUsersListContext.Provider>
                </>
                {isResponseTasksPending || isTasksRefetching ? (
                    <SuspenseFallback size={50} message="Fetching tasks" />
                ) : null}
                {isResponseTasksFailed &&
                !isTasksRefetching &&
                !isResponseTasksPending ? (
                    <FetchError
                        size={50}
                        message="Fetching tasks failed. If this problem will persist, please contact administrator"
                    />
                ) : null}
            </Box>
        </ErrorBoundary>
    );
});
