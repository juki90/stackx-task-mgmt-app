import dayjs from 'dayjs';
import {
    Box,
    Card,
    Table,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Typography,
    TableContainer
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useMe } from '@/hooks/auth/useMe';
import { DATE_FORMAT } from '@/config/constants';
import { FetchError } from '@/components/FetchError';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { MyDashboardTaskDetails } from '@/components/Auth/MyDashboardTaskDetails';

import type { FC } from 'react';

export const MyDashboard: FC = () => {
    const {
        me,
        isError,
        isLoading,
        isSuccess,
        meDataRows,
        viewedTask,
        taskColumns,
        dataUpdatedAt,
        markAsDoneProps,
        isRefetchDisabled,
        setViewedTask,
        handleRefetch
    } = useMe();

    return (
        <ErrorBoundary>
            <Box sx={{ margin: '20px 0' }}>
                {isSuccess ? (
                    <>
                        <Typography
                            component="h2"
                            variant="h5"
                            sx={{ marginBottom: '20px' }}
                        >
                            Account details
                        </Typography>
                        <TableContainer
                            component={Card}
                            sx={{ marginBottom: '30px' }}
                        >
                            <Table aria-label="Account details">
                                <TableBody>
                                    {me
                                        ? meDataRows.map(([field, value]) => (
                                              <TableRow
                                                  key={`me-${field}-${value}`}
                                              >
                                                  <TableCell
                                                      component="th"
                                                      scope="row"
                                                      sx={{ width: '120px' }}
                                                  >
                                                      {field}
                                                  </TableCell>
                                                  <TableCell
                                                      sx={{
                                                          fontWeight: 'bold',
                                                          outline:
                                                              'none !important'
                                                      }}
                                                  >
                                                      {value}
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                        : null}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Typography
                            component="h2"
                            variant="h5"
                            sx={{ marginBottom: '20px' }}
                        >
                            Tasks
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px'
                            }}
                        >
                            <Button
                                size="medium"
                                endIcon={<RefreshIcon />}
                                onClick={handleRefetch}
                                disabled={isRefetchDisabled}
                            >
                                Refresh
                            </Button>
                            <small
                                style={{
                                    fontSize: '80%',
                                    marginLeft: '10px',
                                    verticalAlign: 'center !important'
                                }}
                            >
                                Latest check at <br />
                                <b>
                                    {dayjs(dataUpdatedAt).format(DATE_FORMAT)}
                                </b>
                            </small>
                        </Box>
                        <DataGrid
                            rows={me?.tasks ? me.tasks : []}
                            columns={taskColumns}
                            hideFooter
                            rowSelection
                            hideFooterPagination
                            hideFooterSelectedRowCount
                            sx={{
                                cursor: 'pointer !important',
                                '& .MuiDataGrid-overlayWrapper': {
                                    position: 'none !important',
                                    height: '60px !important'
                                },
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
                            onRowClick={({ row }) => setViewedTask(row)}
                        />
                        <MyDashboardTaskDetails
                            {...markAsDoneProps}
                            task={viewedTask}
                            setTask={setViewedTask}
                        />
                    </>
                ) : null}
                {isLoading ? (
                    <SuspenseFallback
                        size={50}
                        message="Fetching account and tasks"
                    />
                ) : null}
                {isError ? (
                    <FetchError
                        size={50}
                        message="Fetching account data failed. If this problem will persist, please contact administrator"
                    />
                ) : null}
            </Box>
        </ErrorBoundary>
    );
};
