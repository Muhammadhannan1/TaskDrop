import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  Length,
} from 'class-validator';
import { UserOAuthType } from 'utils/Enums/auth/OAuth';

export class AppleSignUpRequestDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sub: string;

  // @ApiProperty({ enum: UserOAuthType })
  // @IsEnum(UserOAuthType)
  // type: UserOAuthType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fcmToken: string;
}
