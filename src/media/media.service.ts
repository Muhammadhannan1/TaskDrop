import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './schema/media.schema';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import { MediaType } from '../../utils/Enums/media/mediaType';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {}

  private AWS_S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
  s3 = new AWS.S3({
    endpoint: process.env.AWS_S3_BUCKET_ENDPOINT, //'https://s3.me-central-1.amazonaws.com' like this but enter your own bucket endpoint
    region: process.env.AWS_S3_BUCKET_REGION, // 'me-central-1' like this but enter your own bucket endpoint
    credentials: {
      accessKeyId: process.env.AWS_S3_BUCKET_IAM_ACCESSKEYID,
      secretAccessKey: process.env.AWS_S3_BUCKET_IAM_SECRETACCESSKEY,
    },
  });
  private _allowedMediaExtensions = {
    [MediaType.IMAGE]: ['png', 'jpg', 'bmp', 'jpeg', 'gif'],
    [MediaType.VIDEO]: ['mov', 'wav', 'mp4', 'avi', 'flv', 'wav', 'mov'],
    [MediaType.DOCUMENT]: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    [MediaType.ARCHIVE]: ['zip', 'gzip'],
    [MediaType.OTHER]: [],
  };

  private _getMediaExtension(fileName: string) {
    return fileName
      .slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
      .toLowerCase();
  }

  private getMediaType(extension: string): MediaType {
    for (const [mediaType, extensions] of Object.entries(
      this._allowedMediaExtensions,
    )) {
      if (extensions.includes(extension)) {
        return mediaType as MediaType;
      }
    }
    return MediaType.OTHER;
  }

  async s3_upload(file: any, name: any, mimetype: any) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (error) {
      console.error(error);
    }
  }

  async deleteFile(payload: any) {
    console.log('payload', payload);
    try {
      await this.s3
        .deleteObject({
          Bucket: this.AWS_S3_BUCKET,
          Key: payload.fileName,
        })
        .promise();
      return {
        status: true,
        message: `File "${payload.fileName}" deleted successfully from bucket "${this.AWS_S3_BUCKET}"`,
        data: null,
      };
    } catch (error) {
      console.error(
        `Error deleting file "${payload.fileName}" from bucket "${this.AWS_S3_BUCKET}":`,
        error,
      );
      throw new Error(error);
    }
  }

  async deleteFiles(
    fileKeys: string[],
  ): Promise<{ status: boolean; message: string }> {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Delete: {
        Objects: fileKeys.map((key) => ({ Key: key })),
      },
    };

    try {
      await this.s3.deleteObjects(params).promise();
      return { status: true, message: 'Files deleted successfully' };
    } catch (error) {
      console.error('Error deleting files:', error);
      throw new Error('Failed to delete files from bucket');
    }
  }

  async deleteMany(filter: any, fileNames?: string[]) {
    if (fileNames && fileNames.length > 0) {
      await this.deleteFiles(fileNames);
    }

    return await this.mediaModel.deleteMany(filter);
  }

  async deleteOne(id: string, fileName?: string) {
    if (fileName !== null) {
      await this.deleteFile(fileName);
    }

    return await this.mediaModel.deleteOne({ _id: new ObjectId(id) });
  }

  async uploadFile(user: any, file: any) {
    /**
     * @NOTE : uncomment below lines when import userService as DI
     * also change code for db
     * */

    const { originalname, buffer, mimetype, encoding, size } = file;

    const timestampPrefix = uuid.v4();

    const modifiedName = `${timestampPrefix}_${originalname}`;
    const extension = this._getMediaExtension(originalname);
    const mediaType = this.getMediaType(extension);

    // if using cdn make the path while creating this and add your own cdn baseUrl this is dummy
    // https://g7erl5wvd4qhk0.cloudfront.net/${String(modifiedName)}

    try {
      const [uploadResult, media] = await Promise.all([
        this.s3_upload(buffer, modifiedName, mimetype),
        this.mediaModel.create({
          userId: new ObjectId(user._id.toString()),
          path: `https://nova-s3.sfo3.cdn.digitaloceanspaces.com/${String(modifiedName)}`,
          name: modifiedName,
          type: mediaType,
          meta: {
            mimetype,
            encoding,
            size,
          },
        }),
      ]);

      return {
        status: true,
        message: 'Media uploaded successfully',
        data: media,
      };
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestException(
          'File size is too large. Maximum allowed size is 200MB.',
        );
      }
    }
  }

  async uploadFiles(user: any, files: any[]) {
    /**
     * @NOTE : uncomment below lines when import userService as DI
     * also change code for DB
     * */

    try {
      const processFile = async (file: any) => {
        const { originalname, mimetype, encoding, size, buffer } = file;

        const timestampPrefix = uuid.v4();
        const modifiedName = `${timestampPrefix}_${originalname}`;
        const extension = this._getMediaExtension(originalname);
        const mediaType = this.getMediaType(extension);

        await this.s3_upload(buffer, modifiedName, mimetype);

        return {
          path: `https://nova-s3.sfo3.cdn.digitaloceanspaces.com/${String(modifiedName)}`,
          name: modifiedName,
          type: mediaType,
          userId: new ObjectId(user._id.toString()),
          meta: { mimetype, encoding, size },
        };
      };

      const uploadPromises = files.map((file) => processFile(file));

      const processedFiles = await Promise.all(uploadPromises);

      const uploadedMedia = await this.mediaModel.insertMany(processedFiles);

      return {
        status: true,
        message: 'Medias uploaded successfully',
        data: uploadedMedia,
      };
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestException(
          'One or more files exceed the 200MB size limit.',
        );
      }
    }
  }

  async findAndDelete(ids: ObjectId[]) {
    return await this.mediaModel.deleteMany({ _id: { $in: ids } });
  }

  async findOne(filter: any) {
    return await this.mediaModel.findOne(filter);
  }

  async create(query: any) {
    return await this.mediaModel.create(query);
  }

  async find(filter: any) {
    return await this.mediaModel.find(filter);
  }

  async findById(id: ObjectId) {
    return await this.mediaModel.findById(id).exec();
  }

  async findMany(ids?: string[]) {
    if (ids && ids.length !== 0) {
      const mediaIds = await this.mediaModel.find({
        _id: { $in: ids.map((id) => new ObjectId(id)) },
      });

      if (ids.length !== mediaIds.length) {
        throw new BadRequestException('one or more media does not exist');
      }

      return mediaIds;
    } else {
      return await this.mediaModel.find();
    }
  }
}
