import deepEqual from 'deep-equal';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController, Control } from 'react-hook-form';
import {
    useState,
    useEffect,
    useContext,
    type Dispatch,
    type SetStateAction
} from 'react';

import { trpc } from '@/plugins/trpc';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import { createOrUpdateTaskValidationSchema } from '@/validations/tasks';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';
import mapTaskUsersToUsersStatusInfo from '@/utilities/mapTaskUsersToUsersStatusInfo';

import type {
    Task,
    TasksSlice,
    TasksCreateRequest,
    TasksUpdateRequest,
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
    const trpcUtils = trpc.useUtils();
    const { userList: userPickerUserList, setUserList: setUserPickerUserList } =
        useContext(UserPickerUsersListContext);
    const [initialPickerUsers, setInitialPickerUsers] =
        useState<TaskUserStatusInfo[]>(userPickerUserList);
    const defaultTaskValues = {
        id: taskToUpdate?.id || '',
        title: taskToUpdate?.title || '',
        description: taskToUpdate?.description || '',
        userIds: initialPickerUsers.map(({ id }) => id)
    };
    const setTasksInStore = selectFromStore(
        'tasks/set'
    ) as TasksSlice['tasks/set'];
    const setTaskInStore = selectFromStore(
        'task/set'
    ) as TasksSlice['task/set'];
    const setTaskPaginationInStore = selectFromStore(
        'taskPagination/set'
    ) as TasksSlice['taskPagination/set'];
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
        (TasksCreateRequest | TasksUpdateRequest) & {
            general?: string;
            other?: string;
        }
    >({
        defaultValues: taskToUpdate ? defaultTaskValues : defaultBlankValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver<TasksCreateRequest | TasksUpdateRequest>(
            createOrUpdateTaskValidationSchema
        )
    });

    const titleFieldController = useController({
        control: control as Control<TasksCreateRequest | TasksUpdateRequest>,
        name: 'title'
    });
    const descriptionFieldController = useController({
        control: control as Control<TasksCreateRequest | TasksUpdateRequest>,
        name: 'description'
    });
    const userIdsFieldController = useController({
        control: control as Control<TasksCreateRequest | TasksUpdateRequest>,
        name: 'userIds'
    });

    const {
        data: createOrUpdateData,
        isLoading: createOrUpdatePending,
        isSuccess: createOrUpdateSuccess,
        mutateAsync: saveTask,
        reset: resetCreateOrUpdateResponse
    } = taskToUpdate
        ? trpc.tasks.update.useMutation()
        : trpc.tasks.create.useMutation();

    const titleErrorMessage = formErrors?.title?.message;
    const descriptionErrorMessage = formErrors?.description?.message;
    const userIdsErrorMessage = formErrors?.userIds?.message;
    const generalResponseError = formErrors?.general?.message;

    const handleSaveTask = handleSubmit(async taskData => {
        try {
            setOtherResponseError('');

            await saveTask(
                taskToUpdate
                    ? { id: taskToUpdate.id, ...taskData }
                    : (taskData as {
                          id: string;
                          description: string;
                          title: string;
                          userIds: string[];
                      } & {
                          description: string;
                          title: string;
                          userIds: string[];
                      })
            );
        } catch (error) {
            handleServerFormErrors(error, setError, setOtherResponseError);
        }
    });

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
        ((!taskToUpdate && !createOrUpdateSuccess) ||
            (taskToUpdate && checkIfFormValuesChanged())) &&
        !generalResponseError &&
        !otherResponseError &&
        isFormValid
    ) {
        saveButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (createOrUpdatePending) {
        saveButtonAttributes.message = taskToUpdate ? 'Updating' : 'Creating';
        saveButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (createOrUpdateSuccess && isFormValid && !otherResponseError) {
        saveButtonAttributes.message = 'Success';
        saveButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const handleUpdateCleanup = () => {
        setTasksInStore([]);
        setTaskInStore(undefined);
        setTaskPaginationInStore(undefined);
        trpcUtils.tasks.fetch.invalidate();
        trpcUtils.tasks.show.invalidate({ id: taskToUpdate?.id });
        resetCreateOrUpdateResponse();
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
        if (createOrUpdateData && otherResponseError) {
            const timeout = setTimeout(
                () => resetCreateOrUpdateResponse(),
                2000
            );

            return () => clearTimeout(timeout);
        }
    }, [createOrUpdateData]);

    useEffect(() => {
        resetCreateOrUpdateResponse();
        resetForm(taskToUpdate ? defaultTaskValues : defaultBlankValues);
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
        if (createOrUpdateData && (otherResponseError || !isFormValid)) {
            handleUpdateCleanup();

            return;
        }

        if (
            createOrUpdateData &&
            createOrUpdateSuccess &&
            !otherResponseError
        ) {
            handleUpdateCleanup();
            handleCloseModal();

            toast.success(messages.successfullySaved);
        }
    }, [createOrUpdateData]);

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
        createOrUpdateSuccess,
        createOrUpdatePending,
        userIdsFieldController,
        descriptionErrorMessage,
        descriptionFieldController,
        resetForm,
        handleSaveTask,
        handleCloseModal,
        setInitialPickerUsers,
        setOtherResponseError,
        setUserPickerUserList,
        checkIfFormValuesChanged
    };
};
