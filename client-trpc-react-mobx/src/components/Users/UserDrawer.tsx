import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import PropTypes, { type Validator } from 'prop-types';
import { Box, Button, Drawer, styled, Typography } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import taskColumns from '@/utilities/taskColumns';
import { FetchError } from '@/components/FetchError';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DATE_FORMAT, ROLES } from '@/config/constants';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { useUserDrawer } from '@/hooks/users/useUserDrawer';

import type { IUserDrawer, User } from '@/types';
import type { FC, Dispatch, SetStateAction } from 'react';

export const UserDrawer: FC<IUserDrawer> = observer(
    ({ viewedUserId, setViewedUser, setIsCreateOrUpdateModalOpen }) => {
        const {
            user,
            loggedUser,
            userToDelete,
            isUserRefetching,
            isRefetchDisabled,
            isResponseUserFailed,
            responseUserUpdatedAt,
            isResponseUserSuccess,
            isResponseUserPending,
            showUserOtherErrorMessage,
            deleteUserOtherErrorMessage,
            setUserToDelete,
            handleDeleteUser,
            handleRefetchUser,
            handleCloseDrawer,
            handleOpenUpdateModal,
            handleCloseDeleteDialog
        } = useUserDrawer({
            viewedUserId,
            setViewedUser,
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

        const StyledUserContentTitle = styled(Typography)(({ theme }) => ({
            fontWeight: 'bold',
            padding: '5px 20px',
            backgroundColor: theme.palette.grey[300]
        }));

        const StyledUserContent = styled(Typography)(() => ({
            padding: '10px 20px'
        }));

        const StyledButton = styled(Button)(() => ({
            border: '1px solid',
            lineHeight: '100%'
        }));

        return (
            <ErrorBoundary>
                <Drawer
                    open={!!viewedUserId}
                    anchor="right"
                    ModalProps={{
                        onClose: () => setViewedUser(undefined)
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
                    {user && !isUserRefetching && isResponseUserSuccess ? (
                        <>
                            <Box>
                                <StyledButtonsBox
                                    sx={{ display: 'flex', padding: '10px' }}
                                >
                                    {user.role?.name !== ROLES.ADMIN ||
                                    loggedUser?.createdById === null ||
                                    user.id === loggedUser?.id ? (
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
                                    ) : null}
                                    {(!loggedUser?.createdById &&
                                        user.id !== loggedUser?.id) ||
                                    (loggedUser?.createdById &&
                                        user.role?.name === ROLES.USER) ? (
                                        <StyledButton
                                            sx={{
                                                color: 'red',
                                                backgroundColor: 'darkred',
                                                marginLeft: '15px'
                                            }}
                                            size="medium"
                                            onClick={() =>
                                                setUserToDelete(user)
                                            }
                                        >
                                            Delete
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
                                    sx={{
                                        fontSize: '120%',
                                        padding: '10px 20px'
                                    }}
                                >
                                    {user.fullName}
                                </StyledTitleBox>
                                <StyledUserContentTitle>
                                    Email
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {user.email}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    First name
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {user.firstName}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    Last name
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {user.lastName}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    Role
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {user.createdBy
                                        ? user.role?.name
                                        : 'Main admin'}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    Created at
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {dayjs(user.createdAt).format(DATE_FORMAT)}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    Updated at
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {dayjs(user.updatedAt).format(DATE_FORMAT)}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    Created by
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    {user.createdBy
                                        ? `${user.createdBy.fullName} (${
                                              user.createdBy.deletedAt
                                                  ? 'Deactivated'
                                                  : user.createdBy.email
                                          })`
                                        : 'System'}
                                </StyledUserContent>
                                <StyledUserContentTitle>
                                    User ID
                                </StyledUserContentTitle>
                                <StyledUserContent>{user.id}</StyledUserContent>
                            </Box>
                            <Box>
                                <StyledUserContentTitle>
                                    Latest tasks
                                </StyledUserContentTitle>
                                <StyledUserContent>
                                    You can filter these tasks by clicking
                                    column icons.
                                </StyledUserContent>
                                <DataGrid
                                    rows={user?.tasks || []}
                                    columns={taskColumns}
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
                                            backgroundColor: '#dfe'
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
                                        onClick={handleRefetchUser}
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
                                                responseUserUpdatedAt || dayjs()
                                            ).format(DATE_FORMAT)}
                                        </b>
                                    </small>
                                </Box>
                            </Box>
                            <ConfirmDialog
                                title="Delete user"
                                description={`You are about to delete user: ${userToDelete?.fullName} (${userToDelete?.email}). Click CONFIRM if you are confident to do it`}
                                isDialogOpen={!!userToDelete}
                                errorMessage={deleteUserOtherErrorMessage}
                                handleConfirm={handleDeleteUser}
                                handleCloseDialog={handleCloseDeleteDialog}
                            />
                        </>
                    ) : null}
                    {isUserRefetching || isResponseUserPending ? (
                        <SuspenseFallback
                            size={50}
                            message="Showing user"
                            center
                        />
                    ) : null}
                    {isResponseUserFailed && !isResponseUserPending ? (
                        <FetchError
                            size={50}
                            center
                            message={
                                showUserOtherErrorMessage ||
                                'Showing user failed. If this problem will persist, please contact administrator'
                            }
                        />
                    ) : null}
                </Drawer>
            </ErrorBoundary>
        );
    }
);

UserDrawer.propTypes = {
    viewedUserId: PropTypes.string,
    setViewedUser: PropTypes.func.isRequired as Validator<
        Dispatch<SetStateAction<User | undefined>>
    >,
    setIsCreateOrUpdateModalOpen: PropTypes.func.isRequired as Validator<
        Dispatch<SetStateAction<boolean>>
    >
};
