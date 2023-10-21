import type { Role, Task, User } from '@/types';

type TModel = Role | Task | User;

export { TModel };

export * from '@/types/models/Role';
export * from '@/types/models/Task';
export * from '@/types/models/User';
