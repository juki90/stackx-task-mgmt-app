import { atom } from 'jotai';

import type { Task, PaginationInfo } from '@/types';

const taskAtom = atom<Task | null>(null);
const tasksAtom = atom<Task[]>([]);
const taskPaginationAtom = atom<PaginationInfo>({
    size: 10,
    index: 0,
    total: 0
});

export { taskAtom, tasksAtom, taskPaginationAtom };
