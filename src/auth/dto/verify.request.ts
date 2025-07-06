import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsInt } from 'class-validator';

export class VerifyUserDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Token is required' })
  @IsInt()
  token: number;
}
