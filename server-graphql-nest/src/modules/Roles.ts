import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@/entities/Role';
import { RoleRepository } from '@/repositories/Role';

@Module({
    imports: [TypeOrmModule.forFeature([Role])],
    providers: [RoleRepository],
    exports: [RoleRepository]
})
export class RolesModule {}
