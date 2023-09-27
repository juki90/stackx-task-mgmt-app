import type { RoleModel, TaskModel, UserModel } from '@/types';

type TModel = RoleModel | TaskModel | UserModel;

export { TModel };

export * from '@/types/models/Role';
export * from '@/types/models/Task';
export * from '@/types/models/User';
