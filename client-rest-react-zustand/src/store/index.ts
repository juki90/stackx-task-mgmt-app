import { create } from 'zustand';

import { createAuthSlice } from '@/store/auth';
import { createUsersSlice } from '@/store/users';

import type { TSlice } from '@/types';

const resetSlicesFns: (() => void)[] = [];

const useBoundStore = create<TSlice>((...args) => ({
    ...createAuthSlice(resetSlicesFns)(...args),
    ...createUsersSlice(resetSlicesFns)(...args)
}));

const selectFromStore = (property: string) => {
    return useBoundStore(state => state[property as keyof TSlice]);
};

const resetAllSlices = () => resetSlicesFns.forEach(fn => fn());

export { selectFromStore, resetAllSlices };
