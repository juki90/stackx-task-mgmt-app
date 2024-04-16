import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
    Dispatch,
    useState,
    useEffect,
    useContext,
    SetStateAction
} from 'react';

import { trpc } from '@/plugins/trpc';
import { en as messages } from '@/locales';
import { RootStore } from '@/context/RootStore';
import { DATE_FORMAT } from '@/config/constants';
import { useCancelTask } from '@/hooks/tasks/useCancelTask';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';
import mapTaskUsersToUsersStatusInfo from '@/utilities/mapTaskUsersToUsersStatusInfo';

import type { User, Task, TaskUsersStatus, TaskUserStatusInfo } from '@/types';

export const useTaskDrawer = ({
    viewedTaskId,
    setViewedTask,
    setIsCreateOrUpdateModalOpen
}: {
    viewedTaskId: string | null | undefined;
    setViewedTask: Dispatch<SetStateAction<Task | null | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const trpcUtils = trpc.useUtils();
    const { tasksStore } = useContext(RootStore);
    const cancelTask = useCancelTask();
    const { setUserList: setUserPickerUserList } = useContext(
        UserPickerUsersListContext
    );
    const [taskToDelete, setTaskToDelete] = useState<Task>();
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [showTaskOtherErrorMessage, setShowTaskOtherErrorMessage] =
        useState('');
    const [deleteTaskOtherErrorMessage, setDeleteTaskOtherErrorMessage] =
        useState('');
    const {
        task: taskInStore,
        setTask: setTaskInStore,
        setTasks: setTasksInStore,
        setTaskPagination: setTaskPaginationInStore
    } = tasksStore;
    const taskId =
        viewedTaskId && taskInStore?.id !== viewedTaskId
            ? viewedTaskId
            : taskInStore?.id;

    const {
        data: responseTask,
        error: responseTaskError,
        isError: isResponseTaskFailed,
        isRefetching: isTaskRefetching,
        isLoading: isResponseTaskPending,
        isSuccess: isResponseTaskSuccess,
        dataUpdatedAt: responseTaskUpdatedAt,
        refetch
    } = trpc.tasks.show.useQuery(
        { id: taskId || '' },
        {
            refetchInterval: false,
            enabled: !!taskId
        }
    );

    const {
        isError: isDeleteTaskFailed,
        isLoading: isDeleteTaskPending,
        isSuccess: isDeleteTaskSuccess,
        mutateAsync: deleteTask
    } = trpc.tasks.delete.useMutation();

    const task = taskInStore ? taskInStore : (responseTask as Task);
    const taskWithMappedUsersStatusInfo = mapTaskUsersToUsersStatusInfo(task);
    const taskUsers = task?.users as User[];
    const usersStatus = task?.usersStatus as TaskUsersStatus;
    const usersStatusWithUserInfo: TaskUserStatusInfo[] = taskUsers?.length
        ? taskUsers
              .filter(
                  (taskUser: User) =>
                      !!usersStatus?.find(
                          ({ userId }: { userId: string }) =>
                              userId === taskUser.id
                      )
              )
              .map((taskUser: User) => {
                  const doneAt = usersStatus?.find(
                      ({ userId }: { userId: string }) => taskUser.id === userId
                  )?.doneAt;

                  return {
                      id: taskUser.id,
                      fullName: taskUser.deletedAt
                          ? `(Deactivated) ${taskUser.fullName}`
                          : taskUser.fullName,
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
            await deleteTask({ id: taskToDelete?.id || '' });
            setViewedTask(null);
            setTaskToDelete(undefined);
            toast.success(messages.successfullyDeleted);
        } catch (error) {
            setTasksInStore([]);
            setTaskInStore(undefined);
            trpcUtils.tasks.fetch.invalidate();
            sharedErrorsHandlers.handleOtherErrors(
                error,
                setDeleteTaskOtherErrorMessage
            );
            sharedErrorsHandlers.handleUnknownError(
                error,
                setDeleteTaskOtherErrorMessage
            );

            return error;
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
        setTaskToDelete(undefined);
        setDeleteTaskOtherErrorMessage('');
    };

    const handleOpenUpdateModal = () => {
        setShowTaskOtherErrorMessage('');
        setIsCreateOrUpdateModalOpen(true);

        if (setUserPickerUserList) {
            setUserPickerUserList(taskWithMappedUsersStatusInfo);
        }

        setViewedTask(task as Task);
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
            setTaskInStore(responseTask as Task);
            setUserPickerUserList(usersStatusWithUserInfo);
        }
    }, [isResponseTaskSuccess, responseTask?.id]);

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
            trpcUtils.tasks.fetch.invalidate();

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
