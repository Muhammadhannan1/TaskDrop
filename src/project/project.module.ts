import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { UserModule } from 'src/user/user.module';
import { Project, ProjectSchema } from './schema/project.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      }),
      inject: [ConfigService],
    }),
    UserModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule { }
