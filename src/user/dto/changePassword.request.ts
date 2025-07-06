import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Match } from 'utils/validators/customValidators';

export class ChangePasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Old Password is required' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'New Password is required' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Confirm Password is required' })
  @Length(8, 30, { message: 'Password must be between 8 and 30 characters' })
  @Match('password', { message: 'Passwords donot match' })
  confirmPassword: string;
}
