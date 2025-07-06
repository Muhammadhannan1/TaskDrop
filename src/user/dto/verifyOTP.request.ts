import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsInt } from 'class-validator';

export class VerifyOTPDTO {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  token: number;
}
