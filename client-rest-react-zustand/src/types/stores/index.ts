import type { AuthSlice } from '@/types';
import type { UsersSlice } from '@/types';
import type { StateCreator } from 'zustand';

type TSlice = AuthSlice & UsersSlice;
type TState = StateCreator<TSlice, [], [], TSlice>;
type PaginationInfo = { size: number; index: number; total: number };

export type { TState, TSlice, PaginationInfo };

export * from '@/types/stores/auth';
export * from '@/types/stores/users';
