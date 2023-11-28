import type { StateCreator } from 'zustand';
import type { AuthSlice, UsersSlice, TasksSlice } from '@/types';

type TSlice = AuthSlice & UsersSlice & TasksSlice;
type TState = StateCreator<TSlice, [], [], TSlice>;
type PaginationInfo = { size: number; index: number; total: number };

export type { TState, TSlice, PaginationInfo };

export * from '@/types/stores/auth';
export * from '@/types/stores/users';
export * from '@/types/stores/tasks';
