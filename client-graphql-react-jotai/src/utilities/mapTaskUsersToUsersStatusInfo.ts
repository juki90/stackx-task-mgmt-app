import dayjs from 'dayjs';

import { DATE_FORMAT } from '@/config/constants';

import type { Task, User } from '@/types';

export default (task: Task | null | undefined) => {
    const usersStatus = task?.usersStatus;

    return (
        task?.users
            ?.filter(
                (taskUser: User) =>
                    !!usersStatus?.find(({ userId }) => userId === taskUser.id)
            )
            .map((taskUser: User) => {
                const doneAt = usersStatus?.find(
                    ({ userId }) => taskUser.id === userId
                )?.doneAt;

                return {
                    id: taskUser.id,
                    fullName: taskUser.fullName,
                    email: taskUser.email,
                    doneAt: doneAt
                        ? dayjs(doneAt).format(DATE_FORMAT)
                        : null || 'PENDING'
                };
            }) || []
    );
};
