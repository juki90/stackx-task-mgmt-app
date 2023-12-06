import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Typography, TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { FetchError } from '@/components/FetchError';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UserDrawer } from '@/components/Users/UserDrawer';
import { useUsersTable } from '@/hooks/users/useUsersTable';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { CreateOrUpdateUser } from '@/components/Users/CreateOrUpdateUser';

import type { FC } from 'react';
import { NetworkStatus } from '@apollo/client';

export const UsersTable: FC = () => {
    const {
        users,
        fetchedAt,
        viewedUser,
        pagination,
        fetchStatus,
        usersFilter,
        usersColumns,
        isRefetching,
        isRefetchDisabled,
        isCreateOrUpdateModalOpen,
        setUsersPage,
        setViewedUser,
        setUsersFilter,
        handleRefetchUsers,
        setIsCreateOrUpdateModalOpen
    } = useUsersTable();

    return (
        <ErrorBoundary>
            <Box sx={{ margin: '20px 0' }}>
                <>
                    <Typography
                        component="h2"
                        variant="h5"
                        sx={{ marginBottom: '20px' }}
                    >
                        Users table
                    </Typography>
                    <Typography
                        component="p"
                        variant="body1"
                        sx={{ marginBottom: '30px' }}
                    >
                        Below you can find all users and administrators. You
                        can't edit or delete administrator who created your
                        account.
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
                            placeholder="Filter users by names and emails"
                            inputProps={{
                                value: usersFilter,
                                onChange: async e =>
                                    setUsersFilter(
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
                                endIcon={
                                    <AddCircleOutlineIcon color="primary" />
                                }
                                sx={{
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    '@media (min-width: 900px)': {
                                        margin: '0 15px'
                                    }
                                }}
                                onClick={() =>
                                    setIsCreateOrUpdateModalOpen(true)
                                }
                            >
                                Create&nbsp;User
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
                                    onClick={handleRefetchUsers}
                                    disabled={isRefetchDisabled}
                                    sx={{ padding: '0 10px' }}
                                >
                                    Refresh
                                </Button>
                                {fetchedAt ? (
                                    <>
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
                                            <b>{fetchedAt}</b>
                                        </small>
                                    </>
                                ) : null}
                            </Box>
                        </Box>
                    </Box>
                    {fetchStatus === NetworkStatus.ready && !isRefetching ? (
                        <DataGrid
                            rows={users || []}
                            columns={usersColumns}
                            hideFooterSelectedRowCount
                            disableColumnMenu
                            disableColumnFilter
                            disableColumnSelector
                            disableDensitySelector
                            sortingMode="server"
                            paginationMode="server"
                            autoHeight
                            localeText={{
                                noRowsLabel: 'No users'
                            }}
                            sx={{
                                cursor: 'pointer !important',
                                borderCollapse: 'collapse',
                                '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus,  & .MuiDataGrid-columnHeader:focus,  & .MuiDataGrid-columnHeader:focus':
                                    {
                                        outline: 'none'
                                    },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#fdf'
                                },
                                '& .MuiDataGrid-iconButtonContainer': {
                                    display: 'none'
                                }
                            }}
                            rowCount={pagination?.total || 0}
                            pageSizeOptions={[5, 10, 25, 50]}
                            paginationModel={{
                                pageSize: pagination.size,
                                page: pagination.index
                            }}
                            onPaginationModelChange={({ pageSize, page }) =>
                                setUsersPage({ size: pageSize, index: page })
                            }
                            onRowClick={({ row }) => setViewedUser(row)}
                        />
                    ) : null}
                    <UserDrawer
                        viewedUserId={viewedUser?.id}
                        setViewedUser={setViewedUser}
                        setIsCreateOrUpdateModalOpen={
                            setIsCreateOrUpdateModalOpen
                        }
                    />
                    <CreateOrUpdateUser
                        user={viewedUser}
                        isModalOpen={isCreateOrUpdateModalOpen}
                        setIsCreateOrUpdateModalOpen={
                            setIsCreateOrUpdateModalOpen
                        }
                    />
                </>
                {fetchStatus < NetworkStatus.ready || isRefetching ? (
                    <SuspenseFallback size={50} message="Fetching users" />
                ) : null}
                {fetchStatus === NetworkStatus.error && !isRefetching ? (
                    <FetchError
                        size={50}
                        message="Fetching users failed. If this problem will persist, please contact administrator"
                    />
                ) : null}
            </Box>
        </ErrorBoundary>
    );
};
