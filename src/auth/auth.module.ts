import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
// import { TokenService } from 'src/token/token.service';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    RedisModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisCoreService],
})
export class AuthModule { }
