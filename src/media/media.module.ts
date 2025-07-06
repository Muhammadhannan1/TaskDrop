import { forwardRef, Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './schema/media.schema';
import { UserModule } from 'src/user/user.module';
import { RedisCoreModule } from 'src/redis-core/redis-core.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisCoreService } from 'src/redis-core/redis-core.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    RedisCoreModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, RedisCoreService],
  exports: [MediaService],
})
export class MediaModule {}
