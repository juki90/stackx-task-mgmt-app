import dayjs from 'dayjs';

import { DATE_FORMAT } from '@/config/constants';

import type { GridValueGetterParams } from '@mui/x-data-grid';

export default [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', width: 260 },
    { field: 'description', headerName: 'Description', width: 260 },
    {
        field: 'status',
        headerName: 'Status',
        width: 100,
        valueGetter: ({ row }: GridValueGetterParams) => {
            const statuses = ['CANCELLED', 'PENDING', 'DONE'];

            return statuses[row.status + 1];
        }
    },
    {
        field: 'usersStatus',
        headerName: 'Done by',
        width: 100,
        valueGetter: ({ row }: GridValueGetterParams) => {
            const numberOfUsersFinishedTask = row.usersStatus.filter(
                ({ doneAt }: { userId: string; doneAt: string }) => doneAt
            ).length;

            return `${numberOfUsersFinishedTask}/${row.usersStatus.length}`;
        }
    },
    {
        field: 'createdAt',
        headerName: 'Created at',
        width: 160,
        valueGetter: ({ row }: GridValueGetterParams) =>
            dayjs(row.createdAt).format(DATE_FORMAT)
    },
    {
        field: 'updatedAt',
        headerName: 'Updated at',
        width: 160,
        valueGetter: ({ row }: GridValueGetterParams) =>
            dayjs(row.updatedAt).format(DATE_FORMAT)
    }
];
