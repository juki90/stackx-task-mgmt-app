import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useQuery, NetworkStatus } from '@apollo/client';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { TASKS_FETCH } from '@/graphql/tasks';
import { DATE_FORMAT } from '@/config/constants';
import { useDebounce } from '@/hooks/useDebounce';
import tasksColumns from '@/utilities/taskColumns';

import type {
    Task,
    TasksSlice,
    PaginationInfo,
    TaskUserStatusInfo
} from '@/types';

export const useTasksTable = () => {
    const tasksInStore = selectFromStore('tasks') as Task[];
    const paginationInStore = selectFromStore(
        'taskPagination'
    ) as PaginationInfo;
    const setTaskPaginationInStore = selectFromStore(
        'taskPagination/set'
    ) as TasksSlice['taskPagination/set'];
    const setTasksInStore = selectFromStore(
        'tasks/set'
    ) as TasksSlice['tasks/set'];
    const [userPickerUserList, setUserPickerUserList] = useState<
        TaskUserStatusInfo[]
    >([]);
    const [viewedTask, setViewedTask] = useState<Task | null | undefined>(null);
    const [tasksPage, setTasksPage] = useState(
        paginationInStore
            ? { size: paginationInStore.size, index: paginationInStore.index }
            : {
                  size: 10,
                  index: 0
              }
    );
    const [tasksFilter, setTasksFilter] = useState('');
    const [isRefetching, setIsRefetching] = useState(false);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [isCreateOrUpdateModalOpen, setIsCreateOrUpdateModalOpen] =
        useState(false);
    const [fetchedAt, setFetchedAt] = useState('');

    const {
        data: responseTasks,
        error: responseError,
        networkStatus: fetchStatus,
        refetch
    } = useQuery(TASKS_FETCH, {
        skip: !!tasksInStore?.length,
        variables: {
            pageData: tasksPage,
            filterData: tasksFilter
        }
    });

    const tasks = (
        tasksInStore?.length ? tasksInStore : responseTasks?.tasks?.rows
    ) as Task[];
    const pagination = paginationInStore
        ? paginationInStore
        : { ...tasksPage, total: responseTasks?.tasks?.count || 0 };

    const handleRefetchTasks = async () => {
        try {
            setIsRefetchDisabled(true);
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setFetchedAt(dayjs().format(DATE_FORMAT));
            setTasksInStore(data?.data?.rows as Task[]);
            setTaskPaginationInStore({
                size: tasksPage.size,
                index: tasksPage.index,
                total: data?.data?.tasks?.count || 0
            });
        } catch (error) {
            setIsRefetching(false);

            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    const handleRefetchByFilterOrOnPaginationChange = async ({
        size,
        index
    }: {
        size: number;
        index: number;
    }) => {
        try {
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setFetchedAt(dayjs().format(DATE_FORMAT));
            setTasksInStore(data?.data?.rows as Task[]);
            setTaskPaginationInStore({
                size,
                index,
                total: data.data?.tasks?.count || 0
            });
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToQueryWithFilter);
        }
    };

    useEffect(() => {
        if (fetchStatus === NetworkStatus.ready && responseTasks) {
            setFetchedAt(dayjs().format(DATE_FORMAT));
            setTasksInStore(responseTasks.rows);
            setTaskPaginationInStore({
                ...pagination,
                total: responseTasks?.tasks?.count
            });
        }

        if (fetchStatus === NetworkStatus.error) {
            console.error(responseError);

            toast.error(messages.internalServerError);
        }
    }, [fetchStatus]);

    useEffect(() => {
        if (isRefetchDisabled) {
            const timeout = setTimeout(
                () => setIsRefetchDisabled(false),
                5 * 1000
            );

            return () => clearTimeout(timeout);
        }
    }, [isRefetchDisabled]);

    useEffect(() => {
        const { size, index } = tasksPage;

        if (
            paginationInStore?.size !== size ||
            paginationInStore?.index !== index
        ) {
            handleRefetchByFilterOrOnPaginationChange({
                index,
                size
            });
        }
    }, [tasksPage.size, tasksPage.index]);

    useEffect(() => {
        if (!isCreateOrUpdateModalOpen && !viewedTask) {
            setUserPickerUserList([]);
        }
    }, [isCreateOrUpdateModalOpen]);

    useDebounce(tasksFilter, () =>
        handleRefetchByFilterOrOnPaginationChange(pagination)
    );

    return {
        tasks,
        fetchedAt,
        pagination,
        viewedTask,
        tasksFilter,
        fetchStatus,
        tasksColumns,
        isRefetching,
        isRefetchDisabled,
        userPickerUserList,
        isCreateOrUpdateModalOpen,
        setTasksPage,
        setViewedTask,
        setTasksFilter,
        handleRefetchTasks,
        setUserPickerUserList,
        setIsCreateOrUpdateModalOpen,
        handleRefetchByFilterOrOnPaginationChange
    };
};
