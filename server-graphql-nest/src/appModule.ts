import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import configuration from '@/config';
import { AuthModule } from '@/modules/Auth';
import { UsersModule } from '@/modules/Users';
import { RolesModule } from '@/modules/Roles';
import { TasksModule } from '@/modules/Tasks';
import formatErrorForForms from '@/plugins/formatErrorForForms';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env${
                process.env.NODE_ENV === 'test' ? '.test' : ''
            }`,
            load: [configuration],
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                ...configService.get('postgres'),
                autoLoadEntities: true
            })
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            typePaths: ['./**/*.graphql'],
            formatError: formatErrorForForms
        }),
        AuthModule,
        UsersModule,
        RolesModule,
        TasksModule
    ],
    providers: []
})
export class AppModule {}
