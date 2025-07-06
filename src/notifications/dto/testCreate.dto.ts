import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../schema/notifications.schema';

export class testNotificationDTO {
  @ApiPropertyOptional({ description: 'will add notification to database' })
  @IsOptional()
  @IsBoolean()
  addToDatabase?: boolean;

  @ApiProperty({
    description: 'The message of the notification',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The fcm(s) token of the recieving user',
    required: true,
  })
  @IsNotEmpty()
  fcm: string | string[];

  @ApiPropertyOptional({
    description: 'The title of the notification',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The info object of the notification',
    required: false,
  })
  @IsOptional()
  info?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'The hasBeenRead flag',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBeenRead?: boolean;

  @ApiProperty({
    description: "The receiver's user(s) ID",
    type: String,
    required: true,
  })
  @IsNotEmpty()
  recieverId: string | string[];

  @ApiProperty({
    description: "The sender's user ID",
    type: String,
    required: true,
  })
  @IsNotEmpty()
  senderId: string;

  @ApiPropertyOptional({
    description: 'The business ID',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({
    description: 'The service ID',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({
    description: 'The type of the notification',
    enum: NotificationType,
    required: true,
  })
  @IsIn(Object.values(NotificationType))
  @IsNotEmpty()
  type: NotificationType;
}
