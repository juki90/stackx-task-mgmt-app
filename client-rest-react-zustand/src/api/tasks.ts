import axios from '@/plugins/axios';

import type {
    TaskShowRequest,
    TaskShowResponse,
    TasksFetchRequest,
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskDeleteRequest,
    TasksFetchResponse,
    TaskUpdateResponse,
    TaskDeleteResponse,
    TaskCreateResponse,
    TasksFetchRequestParams,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';

export const fetchTasks = async ({
    page,
    filter
}: TasksFetchRequest): Promise<TasksFetchResponse> => {
    const params: TasksFetchRequestParams = {
        page: JSON.stringify(page)
    };

    if (filter) {
        params.filter = filter;
    }

    const { data } = await axios.get('/tasks', { params });

    return data;
};

export const showTask = async (
    id: TaskShowRequest
): Promise<TaskShowResponse> => {
    const { data } = await axios.get(`/tasks/${id}`);

    return data;
};

export const createTask = async (
    task: TaskCreateRequest
): Promise<TaskCreateResponse> => {
    const { data } = await axios.post('/tasks', task);

    return data;
};

export const updateTask = async ({
    id,
    ...taskData
}: TaskUpdateRequest): Promise<TaskUpdateResponse> => {
    const { data } = await axios.put(`/tasks/${id}`, taskData);

    return data;
};

export const deleteTask = async (
    id: TaskDeleteRequest
): Promise<TaskDeleteResponse> => {
    const { data } = await axios.delete(`/tasks/${id}`);

    return data;
};

export const changeTaskStatus = async ({
    id,
    status
}: TaskChangeStatusRequest): Promise<TaskChangeStatusResponse> => {
    const { data } = await axios.patch(`/tasks/${id}`, { status });

    return data;
};
