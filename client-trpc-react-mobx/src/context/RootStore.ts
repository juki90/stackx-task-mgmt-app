import { createContext } from 'react';

import { store } from '@/store';

import type { IRootStore } from '@/types';

export const RootStore = createContext<IRootStore>(store);
