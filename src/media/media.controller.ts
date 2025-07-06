import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaRoutes } from './routes';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';

@Controller(MediaRoutes.root)
@ApiTags('Media Controller')
export class MediaController {
  constructor(private readonly _media: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(MediaRoutes.uploadSingle)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 200 * 1024 * 1024, // 200 MB limit (in bytes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload the multimedia files such pdf, video, audio and images',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@Req() req: any, @UploadedFile() file: any) {
    return this._media.uploadFile(req.user_details, file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(MediaRoutes.uploadMultiple)
  @UseInterceptors(
    FilesInterceptor('files', Infinity, {
      limits: {
        files: Infinity,
        fileSize: 200 * 1024 * 1024, // 200 MB limit (in bytes)
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple media files such pdf, video, audio and images',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  uploadFiles(@Req() req: any, @UploadedFiles() files: any[]) {
    return this._media.uploadFiles(req.user_details, files);
  }
}
