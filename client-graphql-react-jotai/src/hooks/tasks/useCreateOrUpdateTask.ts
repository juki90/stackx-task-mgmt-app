import deepEqual from 'deep-equal';
import { useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController, Control } from 'react-hook-form';
import {
    useState,
    useEffect,
    useContext,
    type Dispatch,
    type SetStateAction
} from 'react';

import { en as messages } from '@/locales';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import { taskAtom, taskPaginationAtom, tasksAtom } from '@/atoms/tasks';
import { createOrUpdateTaskValidationSchema } from '@/validations/tasks';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';
import mapTaskUsersToUsersStatusInfo from '@/utilities/mapTaskUsersToUsersStatusInfo';
import {
    TASKS_FETCH,
    TASK_CREATE,
    TASK_SHOW,
    TASK_UPDATE
} from '@/graphql/tasks';

import type {
    Task,
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskUserStatusInfo
} from '@/types';

export const useCreateOrUpdateTask = ({
    task: taskToUpdate,
    setIsCreateOrUpdateModalOpen
}: {
    task: Task | null | undefined;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const defaultBlankValues = {
        title: '',
        description: '',
        userIds: []
    };
    const { userList: userPickerUserList, setUserList: setUserPickerUserList } =
        useContext(UserPickerUsersListContext);
    const [initialPickerUsers, setInitialPickerUsers] =
        useState<TaskUserStatusInfo[]>(userPickerUserList);
    const defaultTaskValues = {
        id: taskToUpdate?.id,
        title: taskToUpdate?.title,
        description: taskToUpdate?.description,
        userIds: initialPickerUsers.map(({ id }) => id)
    };
    const setTasksInStore = useSetAtom(tasksAtom);
    const setTaskInStore = useSetAtom(taskAtom);
    const setTaskPaginationInStore = useSetAtom(taskPaginationAtom);
    const theme = useTheme();
    const [otherResponseError, setOtherResponseError] = useState<string>('');
    const {
        control,
        formState: { errors: formErrors, isValid: isFormValid },
        setValue,
        setError,
        getValues,
        clearErrors,
        handleSubmit,
        reset: resetForm
    } = useForm<
        (TaskCreateRequest | TaskUpdateRequest) & {
            general?: string;
            other?: string;
        }
    >({
        defaultValues: taskToUpdate ? defaultTaskValues : defaultBlankValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver<TaskCreateRequest | TaskUpdateRequest>(
            createOrUpdateTaskValidationSchema
        )
    });

    const titleFieldController = useController({
        control: control as Control<TaskCreateRequest | TaskUpdateRequest>,
        name: 'title'
    });
    const descriptionFieldController = useController({
        control: control as Control<TaskCreateRequest | TaskUpdateRequest>,
        name: 'description'
    });
    const userIdsFieldController = useController({
        control: control as Control<TaskCreateRequest | TaskUpdateRequest>,
        name: 'userIds'
    });

    const refetchQueries = [TASK_SHOW, TASKS_FETCH];

    const [
        createTask,
        {
            data: createTaskData,
            loading: createTaskLoading,
            reset: resetCreateTaskResponse
        }
    ] = useMutation(TASK_CREATE, { refetchQueries });

    const [
        updateTask,
        {
            data: updateTaskData,
            loading: updateTaskLoading,
            reset: resetUpdateTaskResponse
        }
    ] = useMutation(TASK_UPDATE, { refetchQueries });

    const titleErrorMessage = formErrors?.title?.message;
    const descriptionErrorMessage = formErrors?.description?.message;
    const userIdsErrorMessage = formErrors?.userIds?.message;
    const generalResponseError = formErrors?.general?.message;
    const isCreateOrUpdateUserSuccess =
        createTaskData?.createTask || updateTaskData?.updateTask;
    const isCreateOrUpdatePending = createTaskLoading || updateTaskLoading;

    const handleSaveTask = handleSubmit(
        async (
            taskData: TaskCreateRequest | TaskUpdateRequest
        ): Promise<TaskCreateRequest | TaskUpdateRequest | unknown> => {
            try {
                setOtherResponseError('');

                let id, finalTaskPayload;

                if (taskToUpdate) {
                    const { id: taskId, ...taskPayload } =
                        taskData as TaskUpdateRequest;

                    finalTaskPayload = taskPayload;
                    id = taskId;
                }

                if (!taskToUpdate) {
                    finalTaskPayload = taskData;
                }

                (finalTaskPayload as TaskUpdateRequest).userIds =
                    getValues().userIds;

                const data = await (taskToUpdate
                    ? updateTask({
                          variables: {
                              id,
                              updateTaskInput:
                                  finalTaskPayload as TaskUpdateRequest
                          }
                      })
                    : createTask({
                          variables: {
                              createTaskInput:
                                  finalTaskPayload as TaskCreateRequest
                          }
                      }));

                return data;
            } catch (error) {
                handleServerFormErrors(error, setError, setOtherResponseError);

                return error;
            }
        }
    );

    const checkIfFormValuesChanged = () => {
        const currentFormValues = getValues();

        return !deepEqual(
            taskToUpdate
                ? {
                      ...currentFormValues,
                      id: taskToUpdate.id
                  }
                : currentFormValues,
            taskToUpdate ? defaultTaskValues : defaultBlankValues
        );
    };

    const saveButtonAttributes = {
        message: taskToUpdate ? 'Update' : 'Create',
        backgroundColor: theme.palette.grey[400]
    };

    if (
        ((!taskToUpdate && !isCreateOrUpdateUserSuccess) ||
            (taskToUpdate && checkIfFormValuesChanged())) &&
        !generalResponseError &&
        !otherResponseError &&
        isFormValid
    ) {
        saveButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (isCreateOrUpdatePending) {
        saveButtonAttributes.message = taskToUpdate ? 'Updating' : 'Creating';
        saveButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (isCreateOrUpdateUserSuccess && isFormValid && !otherResponseError) {
        saveButtonAttributes.message = 'Success';
        saveButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const handleUpdateCleanup = () => {
        setTasksInStore([]);
        setTaskInStore(null);
        setTaskPaginationInStore({ size: 10, index: 0, total: 0 });
        taskToUpdate ? resetUpdateTaskResponse() : resetCreateTaskResponse();
    };

    const handleCloseModal = () => {
        resetForm(taskToUpdate ? defaultTaskValues : defaultBlankValues);
        setOtherResponseError('');

        if (setUserPickerUserList) {
            setUserPickerUserList(mapTaskUsersToUsersStatusInfo(taskToUpdate));
        }

        setIsCreateOrUpdateModalOpen(false);
    };

    useEffect(() => {
        if (isCreateOrUpdateUserSuccess && otherResponseError) {
            const timeout = setTimeout(
                () =>
                    taskToUpdate
                        ? resetUpdateTaskResponse()
                        : resetCreateTaskResponse(),
                2000
            );

            return () => clearTimeout(timeout);
        }
    }, [isCreateOrUpdateUserSuccess]);

    useEffect(() => {
        taskToUpdate ? resetUpdateTaskResponse() : resetCreateTaskResponse();
        resetForm(taskToUpdate ? defaultTaskValues : defaultBlankValues);
        setTaskInStore(null);
        setOtherResponseError('');

        if (!taskToUpdate && setUserPickerUserList) {
            setUserPickerUserList([]);
            setInitialPickerUsers([]);
        }

        if (taskToUpdate && setUserPickerUserList) {
            setUserPickerUserList(mapTaskUsersToUsersStatusInfo(taskToUpdate));
            setInitialPickerUsers(mapTaskUsersToUsersStatusInfo(taskToUpdate));
        }
    }, [taskToUpdate]);

    useEffect(() => {
        if (
            isCreateOrUpdateUserSuccess &&
            (otherResponseError || !isFormValid)
        ) {
            handleUpdateCleanup();

            return;
        }

        if (isCreateOrUpdateUserSuccess && !otherResponseError) {
            handleUpdateCleanup();
            handleCloseModal();

            toast.success(messages.successfullySaved);
        }
    }, [isCreateOrUpdateUserSuccess]);

    useEffect(() => {
        const isFormChanged = checkIfFormValuesChanged();

        if (
            !isFormValid &&
            userPickerUserList.length <= 50 &&
            userPickerUserList.length > 0
        ) {
            clearErrors('userIds');
        }

        if (
            taskToUpdate &&
            (!userPickerUserList.length || userPickerUserList.length > 50)
        ) {
            setError('userIds', {
                message: messages.validators.tasks.userIdsIncorrectAmount
            });
        }

        if (formErrors?.general?.message) {
            clearErrors('general');
        }

        setValue(
            'userIds',
            userPickerUserList.map(user => user.id),
            {
                shouldDirty: isFormChanged,
                shouldTouch: isFormChanged,
                shouldValidate: isFormChanged
            }
        );
    }, [userPickerUserList]);

    return {
        theme,
        isFormValid,
        titleErrorMessage,
        initialPickerUsers,
        otherResponseError,
        userIdsErrorMessage,
        generalResponseError,
        saveButtonAttributes,
        titleFieldController,
        userIdsFieldController,
        isCreateOrUpdatePending,
        descriptionErrorMessage,
        descriptionFieldController,
        isCreateOrUpdateUserSuccess,
        resetForm,
        handleSaveTask,
        handleCloseModal,
        setInitialPickerUsers,
        setOtherResponseError,
        setUserPickerUserList,
        checkIfFormValuesChanged
    };
};
