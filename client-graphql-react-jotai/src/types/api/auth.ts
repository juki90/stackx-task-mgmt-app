import { User } from '@/types';

type AuthLoginRequest = {
    email: string;
    password: string;
};

type AuthLoginResponse = User;
type AuthMeResponse = User;

export type { AuthMeResponse, AuthLoginRequest, AuthLoginResponse };
