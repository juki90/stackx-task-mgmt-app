import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useQuery, useMutation, NetworkStatus } from '@apollo/client';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState
} from 'react';

import { en as messages } from '@/locales';
import { DATE_FORMAT } from '@/config/constants';
import { useCancelTask } from '@/hooks/tasks/useCancelTask';
import { TASKS_FETCH, TASK_DELETE, TASK_SHOW } from '@/graphql/tasks';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';
import { taskAtom, tasksAtom, taskPaginationAtom } from '@/atoms/tasks';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';
import mapTaskUsersToUsersStatusInfo from '@/utilities/mapTaskUsersToUsersStatusInfo';

import type { Task } from '@/types';
import { useAtom, useSetAtom } from 'jotai';

export const useTaskDrawer = ({
    viewedTaskId,
    setViewedTask,
    setIsCreateOrUpdateModalOpen
}: {
    viewedTaskId: string | null | undefined;
    setViewedTask: Dispatch<SetStateAction<Task | null | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const cancelTask = useCancelTask();
    const { setUserList: setUserPickerUserList } = useContext(
        UserPickerUsersListContext
    );
    const [fetchedAt, setFetchedAt] = useState('');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isRefetching, setIsRefetching] = useState(false);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [showTaskOtherErrorMessage, setShowTaskOtherErrorMessage] =
        useState('');
    const [deleteTaskOtherErrorMessage, setDeleteTaskOtherErrorMessage] =
        useState('');
    const [taskInStore, setTaskInStore] = useAtom(taskAtom);
    const setTasksInStore = useSetAtom(tasksAtom);
    const setTaskPaginationInStore = useSetAtom(taskPaginationAtom);

    const taskId =
        taskInStore?.id !== viewedTaskId ? viewedTaskId : taskInStore?.id;

    const {
        data: showTaskResponseData,
        error: showTaskResponseError,
        networkStatus: showStatus,
        refetch
    } = useQuery(TASK_SHOW, {
        skip: !taskId,
        variables: {
            id: taskId
        }
    });

    const [deleteTask, { data: deleteTaskData, error: deleteTaskError }] =
        useMutation(TASK_DELETE, {
            refetchQueries: [TASKS_FETCH]
        });

    const task = (
        taskInStore ? taskInStore : showTaskResponseData?.task
    ) as Task;
    const usersStatusWithUserInfo = mapTaskUsersToUsersStatusInfo(task);
    const usersStatusColumns = [
        { field: 'fullName', headerName: 'Full name', width: 180 },
        { field: 'email', headerName: 'Email', width: 260 },
        {
            field: 'doneAt',
            headerName: 'Done at',
            width: 200
        },
        {
            field: 'id',
            headerName: 'User id',
            width: 400
        }
    ];

    const handleDeleteTask = async () => {
        try {
            await deleteTask({ variables: { id: taskToDelete?.id || '' } });

            setViewedTask(null);
            setTaskToDelete(null);
        } catch (error) {
            setTasksInStore([]);
            setTaskInStore(null);

            sharedErrorsHandlers.handleOtherErrors(
                error,
                setDeleteTaskOtherErrorMessage
            );
            sharedErrorsHandlers.handleUnknownError(
                error,
                setDeleteTaskOtherErrorMessage
            );
        }
    };

    const handleRefetchTask = async () => {
        try {
            setIsRefetchDisabled(true);
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setFetchedAt(dayjs().format(DATE_FORMAT));
            setTaskInStore(data?.data?.task as Task);
        } catch (error) {
            setIsRefetching(false);

            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    const handleCloseDrawer = () => {
        setShowTaskOtherErrorMessage('');
        setViewedTask(null);
    };

    const handleCloseDeleteDialog = () => {
        setTaskToDelete(null);
        setDeleteTaskOtherErrorMessage('');
    };

    const handleOpenUpdateModal = () => {
        setShowTaskOtherErrorMessage('');
        setIsCreateOrUpdateModalOpen(true);

        if (setUserPickerUserList) {
            setUserPickerUserList(mapTaskUsersToUsersStatusInfo(task));
        }

        setViewedTask(task);
    };

    useEffect(() => {
        if (
            showStatus === NetworkStatus.ready &&
            showTaskResponseData &&
            setUserPickerUserList
        ) {
            setFetchedAt(dayjs().format(DATE_FORMAT));
            setTaskInStore(showTaskResponseData?.task);
            setUserPickerUserList(usersStatusWithUserInfo);
        }

        if (showStatus === NetworkStatus.error && showTaskResponseError) {
            console.error(showTaskResponseError);

            handleServerShowErrors(
                showTaskResponseError,
                setShowTaskOtherErrorMessage
            );

            setTaskInStore(null);
        }
    }, [showStatus]);

    useEffect(() => {
        if (isRefetchDisabled) {
            const timeout = setTimeout(
                () => setIsRefetchDisabled(false),
                10 * 1000
            );

            return () => clearTimeout(timeout);
        }
    }, [isRefetchDisabled]);

    useEffect(() => {
        if (deleteTaskError) {
            setTaskInStore(null);
            setTasksInStore([]);
            setTaskPaginationInStore({ size: 10, index: 0, total: 0 });

            if (setUserPickerUserList) {
                setUserPickerUserList([]);
            }

            toast.success(messages.successfullyDeleted);
        }
    }, [deleteTaskData]);

    return {
        task,
        fetchedAt,
        cancelTask,
        showStatus,
        taskToDelete,
        isRefetching,
        isRefetchDisabled,
        usersStatusColumns,
        usersStatusWithUserInfo,
        showTaskOtherErrorMessage,
        deleteTaskOtherErrorMessage,
        setTaskToDelete,
        handleDeleteTask,
        handleRefetchTask,
        handleCloseDrawer,
        handleOpenUpdateModal,
        handleCloseDeleteDialog,
        setShowTaskOtherErrorMessage,
        setDeleteTaskOtherErrorMessage
    };
};
