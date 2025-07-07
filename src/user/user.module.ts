import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from 'nestjs-redis';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenModule } from 'src/token/token.module';
import { MediaModule } from 'src/media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { RedisCoreService } from 'src/redis-core/redis-core.service';
import { ProjectModule } from 'src/project/project.module';
import { ProjectService } from 'src/project/project.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MediaModule,
    RedisModule,
    TokenModule,
    forwardRef(() => ProjectModule),
  ],
  controllers: [UserController],
  providers: [UserService, RedisCoreService],
  exports: [UserService],
})
export class UserModule {}
