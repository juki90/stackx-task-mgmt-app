import axios from '@/plugins/axios';

import type {
    UserShowRequest,
    UserShowResponse,
    UsersFetchRequest,
    UserCreateRequest,
    UserUpdateRequest,
    UserDeleteRequest,
    UsersFetchResponse,
    UserUpdateResponse,
    UserDeleteResponse,
    UserCreateResponse,
    UsersFetchRequestParams
} from '@/types';

export const fetchUsers = async ({
    page,
    filter
}: UsersFetchRequest): Promise<UsersFetchResponse> => {
    const params: UsersFetchRequestParams = {
        page: JSON.stringify(page)
    };

    if (filter) {
        params.filter = filter;
    }

    const { data } = await axios.get('/users', { params });

    return data;
};

export const showUser = async (
    id: UserShowRequest
): Promise<UserShowResponse> => {
    const { data } = await axios.get(`/users/${id}`);

    return data;
};

export const createUser = async (
    user: UserCreateRequest
): Promise<UserCreateResponse> => {
    const { data } = await axios.post('/users', user);

    return data;
};

export const updateUser = async ({
    id,
    ...userData
}: UserUpdateRequest): Promise<UserUpdateResponse> => {
    const { data } = await axios.put(`/users/${id}`, userData);

    return data;
};

export const deleteUser = async (
    id: UserDeleteRequest
): Promise<UserDeleteResponse> => {
    const { data } = await axios.delete(`/users/${id}`);

    return data;
};
