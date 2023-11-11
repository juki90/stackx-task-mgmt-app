import axios from '@/plugins/axios';

import type { AuthLoginRequest, AuthLoginResponse } from '@/types';

export const authLogin = async (
    payload: AuthLoginRequest
): Promise<AuthLoginResponse> => {
    const { data } = await axios.post('/auth/login', payload);

    return data;
};
