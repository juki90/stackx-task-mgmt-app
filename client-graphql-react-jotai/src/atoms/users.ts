import { atom } from 'jotai';

import type { User, PaginationInfo } from '@/types';

const userAtom = atom<User | null>(null);
const usersAtom = atom<User[]>([]);
const userPaginationAtom = atom<PaginationInfo>({
    size: 10,
    index: 0,
    total: 0
});

export { userAtom, usersAtom, userPaginationAtom };
