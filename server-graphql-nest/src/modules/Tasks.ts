import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { Task } from '@/entities/Task';
import { AuthModule } from '@/modules/Auth';
import { UsersModule } from '@/modules/Users';
import { JwtGuard } from '@/middlewares/JwtGuard';
import { TaskRepository } from '@/repositories/Task';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { TasksShowService } from '@/services/Task/ShowService';
import { TasksFetchService } from '@/services/Task/FetchService';
import { TaskShowResolver } from '@/resolvers/Task/ShowResolver';
import { TasksDeleteService } from '@/services/Task/DeleteService';
import { TasksCreateService } from '@/services/Task/CreateService';
import { TasksUpdateService } from '@/services/Task/UpdateService';
import { TasksFetchResolver } from '@/resolvers/Task/FetchResolver';
import { TaskCreateResolver } from '@/resolvers/Task/CreateResolver';
import { TaskUpdateResolver } from '@/resolvers/Task/UpdateResolver';
import { TaskDeleteResolver } from '@/resolvers/Task/DeleteResolver';
import { TaskUsersFieldResolver } from '@/resolvers/Task/UsersFieldResolver';
import { TaskCreatedByFieldResolver } from '@/resolvers/Task/CreatedByFieldResolver';
import { TaskUpdatedByFieldResolver } from '@/resolvers/Task/UpdatedByFieldResolver';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([Task])
    ],
    providers: [
        JwtGuard,
        AdminGuard,
        TaskRepository,
        TasksShowService,
        TaskShowResolver,
        TasksFetchService,
        TasksCreateService,
        TasksUpdateService,
        TasksDeleteService,
        TasksFetchResolver,
        TaskCreateResolver,
        TaskUpdateResolver,
        TaskDeleteResolver,
        TaskUsersFieldResolver,
        TaskCreatedByFieldResolver,
        TaskUpdatedByFieldResolver
    ],
    exports: [TaskRepository]
})
export class TasksModule {}
