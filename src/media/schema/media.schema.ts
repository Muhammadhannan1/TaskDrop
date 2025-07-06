import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsIn } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MediaType } from '../../../utils/Enums/media/mediaType';

export type MediaDocument = Media & Document;

@Schema({ timestamps: false, _id: false, versionKey: false })
export class MediaMeta {
  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  encoding: string;
}

@Schema({ timestamps: true, versionKey: false, minimize: true })
export class Media extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  @IsIn(
    [
      MediaType.ARCHIVE,
      MediaType.DOCUMENT,
      MediaType.IMAGE,
      MediaType.VIDEO,
      MediaType.OTHER,
    ],
    { message: 'media must be on of [IMAGE, VIDEO, DOCUMENT, ARCHIVE, OTHER]' },
  )
  type: string;

  @Prop({ required: true, type: MediaMeta, _id: false })
  meta: MediaMeta;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
