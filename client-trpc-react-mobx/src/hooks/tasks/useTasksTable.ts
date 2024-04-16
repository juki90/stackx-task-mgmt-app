import toast from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';

import { trpc } from '@/plugins/trpc';
import { en as messages } from '@/locales';
import { RootStore } from '@/context/RootStore';
import { useDebounce } from '@/hooks/useDebounce';
import tasksColumns from '@/utilities/taskColumns';

import type { Task, TaskUserStatusInfo } from '@/types';

export const useTasksTable = () => {
    const { tasksStore } = useContext(RootStore);
    const {
        tasks: tasksInStore,
        taskPagination: paginationInStore,
        setTaskPagination: setTaskPaginationInStore,
        setTasks: setTasksInStore
    } = tasksStore;
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
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [isCreateOrUpdateModalOpen, setIsCreateOrUpdateModalOpen] =
        useState(false);

    const {
        data: responseTasks,
        error: responseTasksError,
        isError: isResponseTasksFailed,
        isRefetching: isTasksRefetching,
        isLoading: isResponseTasksPending,
        isSuccess: isResponseTasksSuccess,
        dataUpdatedAt: responseTasksUpdatedAt,
        refetch
    } = trpc.tasks.fetch.useQuery(
        {
            page: tasksPage,
            filter: tasksFilter
        },
        {
            refetchInterval: false,
            enabled: !tasksInStore?.length
        }
    );

    const tasks = tasksInStore?.length
        ? tasksInStore
        : (responseTasks?.rows as Task[]);
    const pagination = paginationInStore
        ? paginationInStore
        : { ...tasksPage, total: responseTasks?.count || 0 };

    const handleRefetchTasks = async () => {
        try {
            setIsRefetchDisabled(true);

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setTasksInStore(data?.data?.rows as Task[]);
            setTaskPaginationInStore({
                size: tasksPage.size,
                index: tasksPage.index,
                total: data?.data?.count || 0
            });
            toast.success(messages.successfullyRefetchedData);
        } catch (error) {
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
            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setTasksInStore(data?.data?.rows as Task[]);
            setTaskPaginationInStore({
                size,
                index,
                total: data.data?.count || 0
            });
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToQueryWithFilter);
        }
    };

    useEffect(() => {
        if (isResponseTasksFailed) {
            console.error(responseTasksError);

            toast.error(messages.internalServerError);
        }
    }, [isResponseTasksFailed]);

    useEffect(() => {
        if (isResponseTasksSuccess && responseTasks) {
            setTasksInStore(responseTasks.rows as Task[]);
            setTaskPaginationInStore({
                ...pagination,
                total: responseTasks.count
            });
        }
    }, [isResponseTasksSuccess]);

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
        pagination,
        viewedTask,
        tasksFilter,
        tasksColumns,
        isTasksRefetching,
        isRefetchDisabled,
        userPickerUserList,
        isResponseTasksFailed,
        isResponseTasksPending,
        isResponseTasksSuccess,
        responseTasksUpdatedAt,
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
