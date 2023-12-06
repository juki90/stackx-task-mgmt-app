import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { DATE_FORMAT } from '@/config/constants';
import { useCancelTask } from '@/hooks/tasks/useCancelTask';
import { showTask, deleteTask as deleteTaskApi } from '@/api/tasks';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';
import type {
    User,
    Task,
    TasksSlice,
    TaskDeleteRequest,
    TaskDeleteResponse
} from '@/types';
import mapTaskUsersToUsersStatusInfo from '@/utilities/mapTaskUsersToUsersStatusInfo';

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
    const queryClient = useQueryClient();
    const { setUserList: setUserPickerUserList } = useContext(
        UserPickerUsersListContext
    );
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [showTaskOtherErrorMessage, setShowTaskOtherErrorMessage] =
        useState('');
    const [deleteTaskOtherErrorMessage, setDeleteTaskOtherErrorMessage] =
        useState('');
    const taskInStore = selectFromStore('task') as Task;
    const setTaskInStore = selectFromStore(
        'task/set'
    ) as TasksSlice['task/set'];
    const setTasksInStore = selectFromStore(
        'tasks/set'
    ) as TasksSlice['tasks/set'];
    const setTaskPaginationInStore = selectFromStore(
        'taskPagination/set'
    ) as TasksSlice['taskPagination/set'];
    const taskId =
        taskInStore?.id !== viewedTaskId ? viewedTaskId : taskInStore?.id;

    const {
        data: responseTask,
        error: responseTaskError,
        isError: isResponseTaskFailed,
        isRefetching: isTaskRefetching,
        isPending: isResponseTaskPending,
        isSuccess: isResponseTaskSuccess,
        dataUpdatedAt: responseTaskUpdatedAt,
        refetch
    } = useQuery({
        queryFn: () => showTask(taskId as string),
        queryKey: ['task', taskId],
        refetchInterval: false,
        enabled: !!taskId
    });

    const {
        isError: isDeleteTaskFailed,
        isPending: isDeleteTaskPending,
        isSuccess: isDeleteTaskSuccess,
        mutateAsync: deleteTask
    } = useMutation({
        async mutationFn(
            id: TaskDeleteRequest
        ): Promise<TaskDeleteResponse | unknown> {
            return deleteTaskApi(id);
        }
    });

    const task = (taskInStore ? taskInStore : responseTask) as Task;
    const taskUsers = task?.users;
    const usersStatus = task?.usersStatus;
    const usersStatusWithUserInfo = taskUsers?.length
        ? taskUsers
              .filter(
                  (taskUser: User) =>
                      !!usersStatus?.find(
                          ({ userId }) => userId === taskUser.id
                      )
              )
              .map((taskUser: User) => {
                  const doneAt = usersStatus?.find(
                      ({ userId }) => taskUser.id === userId
                  )?.doneAt;

                  return {
                      id: taskUser.id,
                      fullName: taskUser.fullName,
                      email: taskUser.email,
                      doneAt: doneAt
                          ? dayjs(doneAt).format(DATE_FORMAT)
                          : null || 'PENDING'
                  };
              })
        : [];

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
            await deleteTask(taskToDelete?.id || '');

            setViewedTask(null);
            setTaskToDelete(null);
            toast.success(messages.successfullyDeleted);
        } catch (error) {
            setTasksInStore([]);
            setTaskInStore(undefined);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({
                queryKey: ['task', taskToDelete?.id]
            });

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

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setTaskInStore(data?.data as Task);
        } catch (error) {
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
        if (isResponseTaskFailed && responseTaskError) {
            console.error(responseTaskError);

            handleServerShowErrors(
                responseTaskError,
                setShowTaskOtherErrorMessage
            );

            setTaskInStore(undefined);
        }
    }, [isResponseTaskFailed]);

    useEffect(() => {
        if (isResponseTaskSuccess && responseTask && setUserPickerUserList) {
            setTaskInStore(responseTask);
            setUserPickerUserList(usersStatusWithUserInfo);
        }
    }, [isResponseTaskSuccess]);

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
        if (isDeleteTaskSuccess) {
            setTaskInStore(undefined);
            setTasksInStore([]);
            setTaskPaginationInStore(undefined);
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });

            if (setUserPickerUserList) {
                setUserPickerUserList([]);
            }

            toast.success(messages.successfullyDeleted);
        }
    }, [isDeleteTaskSuccess]);

    return {
        task,
        cancelTask,
        taskToDelete,
        isTaskRefetching,
        isRefetchDisabled,
        usersStatusColumns,
        isDeleteTaskFailed,
        isDeleteTaskPending,
        isDeleteTaskSuccess,
        isResponseTaskFailed,
        isResponseTaskSuccess,
        responseTaskUpdatedAt,
        isResponseTaskPending,
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
