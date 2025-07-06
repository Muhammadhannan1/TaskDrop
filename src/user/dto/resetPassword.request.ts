import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsInt, IsString, Length } from 'class-validator';
import { Match } from 'utils/validators/customValidators';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Token is required' })
  @IsInt()
  token: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Confirm Password is required' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  @Match('password', { message: 'Passwords donot match' })
  confirmPassword: string;
}
