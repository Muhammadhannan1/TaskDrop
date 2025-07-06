import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'utils/validators/customValidators';

export class UploadMedia {
  @ApiProperty()
  @IsNotEmpty()
  @IsObjectId()
  userId: string;
}
