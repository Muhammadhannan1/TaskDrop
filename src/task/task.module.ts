import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task, TaskSchema } from './schema/task.schema';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ProjectModule,
    UserModule,
    TokenModule
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService]
})
export class TaskModule {}
