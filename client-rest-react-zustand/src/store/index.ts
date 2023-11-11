import { create } from 'zustand';

import { createAuthSlice } from '@/store/auth';

import type { TSlice, TState } from '@/types';

const sliceCreators: { [s: string]: TState } = {
    auth: createAuthSlice
};

const useBoundStore = create<TSlice>()((...args) => ({
    ...createAuthSlice(...args)
}));

const resetAllSlices = () => {
    for (const sliceName in Object.keys(sliceCreators)) {
        const resetSlice = useBoundStore(
            state => state[`${sliceName}/reset` as keyof TSlice]
        );

        if (resetSlice) {
            (resetSlice as () => void)();
        }
    }
};

const useStore = (property: string) =>
    useBoundStore(state => state[property as keyof TSlice]);

export { useStore, resetAllSlices };
