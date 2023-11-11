import type { AuthSlice } from '@/types';
import type { StateCreator } from 'zustand';

type TSlice = AuthSlice;
type TState = StateCreator<TSlice, [], [], TSlice>;

export type { TState, TSlice };
export * from '@/types/stores/auth';
