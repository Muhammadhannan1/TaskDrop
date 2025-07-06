import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Length,
} from 'class-validator';
import { UserOAuthType } from 'utils/Enums/auth/OAuth';

export class GoogleSignUpRequestDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  //   @ApiProperty({ enum: UserOAuthType })
  //   @IsEnum(UserOAuthType)
  //   type: UserOAuthType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fcmToken: string;
}
