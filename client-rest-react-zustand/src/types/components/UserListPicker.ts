import type { UseControllerReturn } from 'react-hook-form';
import type { TaskCreateRequest, TaskUpdateRequest } from '@/types';

export interface IUserListPicker {
    fieldController: UseControllerReturn<
        TaskCreateRequest | TaskUpdateRequest,
        'userIds'
    >;
}
