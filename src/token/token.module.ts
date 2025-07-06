import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    // RedisModule,
  ],
  providers: [TokenService, JwtModule],//RedisCoreService
  exports: [TokenService]
})
export class TokenModule { }
