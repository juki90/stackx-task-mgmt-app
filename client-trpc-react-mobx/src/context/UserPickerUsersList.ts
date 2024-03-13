import { Dispatch, SetStateAction, createContext } from 'react';

import type { TaskUserStatusInfo } from '@/types';

export const UserPickerUsersListContext = createContext<{
    userList: TaskUserStatusInfo[];
    setUserList: Dispatch<SetStateAction<TaskUserStatusInfo[]>> | null;
}>({ userList: [], setUserList: null });
