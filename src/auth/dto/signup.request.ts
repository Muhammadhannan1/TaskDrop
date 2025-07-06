import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from 'utils/validators/customValidators';
// import { Match } from 'src/user/dto/user.dto';

export class CreateUserDTO {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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
