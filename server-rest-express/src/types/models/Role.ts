import type RoleModel from '@/models/Role';
import type { ModelStatic } from 'sequelize-typescript';

type Role = RoleModel;

type RoleModelStatic = ModelStatic<RoleModel>;

export type { Role, RoleModel, RoleModelStatic };
