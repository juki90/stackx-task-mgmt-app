import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { User } from '@/entities/User';
import { AuthModule } from '@/modules/Auth';
import { RolesModule } from '@/modules/Roles';
import { TasksModule } from '@/modules/Tasks';
import { JwtGuard } from '@/middlewares/JwtGuard';
import { UserRepository } from '@/repositories/User';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { UsersShowService } from '@/services/User/ShowService';
import { UserShowResolver } from '@/resolvers/User/ShowResolver';
import { UsersFetchService } from '@/services/User/FetchService';
import { UsersCreateService } from '@/services/User/CreateService';
import { UsersUpdateService } from '@/services/User/UpdateService';
import { UsersDeleteService } from '@/services/User/DeleteService';
import { UsersFetchResolver } from '@/resolvers/User/FetchResolver';
import { UserCreateResolver } from '@/resolvers/User/CreateResolver';
import { UserUpdateResolver } from '@/resolvers/User/UpdateResolver';
import { UserDeleteResolver } from '@/resolvers/User/DeleteResolver';
import { UserTasksFieldResolver } from '@/resolvers/User/TasksFieldResolver';
import { UserRoleFieldResolver } from '@/resolvers/User/RoleFieldResolver';
import { UserCreatedByFieldResolver } from '@/resolvers/User/CreatedByFieldResolver';

@Module({
    imports: [
        forwardRef(() => TasksModule),
        forwardRef(() => AuthModule),
        RolesModule,
        TypeOrmModule.forFeature([User])
    ],
    providers: [
        JwtGuard,
        AdminGuard,
        UserRepository,
        UserShowResolver,
        UsersShowService,
        UsersFetchService,
        UsersCreateService,
        UsersUpdateService,
        UsersDeleteService,
        UsersFetchResolver,
        UserCreateResolver,
        UserUpdateResolver,
        UserDeleteResolver,
        UserRoleFieldResolver,
        UserTasksFieldResolver,
        UserCreatedByFieldResolver
    ],
    exports: [UserRepository]
})
export class UsersModule {}
