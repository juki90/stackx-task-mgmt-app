import { JwtModule } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@/modules/Users';
import { JwtAuthService } from '@/services/JwtAuth';
import { MeService } from '@/services/Auth/MeService';
import { MeResolver } from '@/resolvers/Auth/MeResolver';
import { LoginService } from '@/services/Auth/LoginService';
import { LoginResolver } from '@/resolvers/Auth/LoginResolver';
import { JwtGuard } from '@/middlewares/JwtGuard';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const { secret, expiresIn } = configService.get('jwt');

                return {
                    global: true,
                    secret,
                    signOptions: { expiresIn }
                };
            },
            inject: [ConfigService]
        })
    ],
    providers: [
        JwtGuard,
        MeService,
        MeResolver,
        LoginService,
        LoginResolver,
        JwtAuthService
    ],
    exports: [JwtGuard, JwtAuthService]
})
export class AuthModule {}
