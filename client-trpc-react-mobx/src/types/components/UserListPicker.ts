import type { UseControllerReturn } from 'react-hook-form';
import type { TasksCreateRequest, TasksUpdateRequest } from '@/types';

export interface IUserListPicker {
    fieldController: UseControllerReturn<
        TasksCreateRequest | TasksUpdateRequest,
        'userIds'
    >;
}
