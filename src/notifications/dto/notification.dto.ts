import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class setFcmToken {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  FcmToken: string;
}
