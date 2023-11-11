import { User } from '@/types';

type AuthLoginRequest = {
    email: string;
    password: string;
};

type AuthLoginResponse = User;

export type { AuthLoginRequest, AuthLoginResponse };
