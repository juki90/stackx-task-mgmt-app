import axios from '@/plugins/axios';

import type {
    AuthMeResponse,
    AuthLoginRequest,
    AuthLoginResponse
} from '@/types';

export const authLogin = async (
    payload: AuthLoginRequest
): Promise<AuthLoginResponse> => {
    const { data } = await axios.post('/auth/login', payload);

    return data;
};
export const authMe = async (): Promise<AuthMeResponse> => {
    const { data } = await axios.get('/auth/me');

    return data;
};
