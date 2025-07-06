import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsIn } from 'class-validator';
import { OtpTypes } from 'utils/Enums/auth/otp';

export class ResendOTPDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'OTP type is required' })
  @IsIn(Object.values(OtpTypes), {
    message: `Type must be either ${Object.values(OtpTypes)
      .map((item) => item)
      .join(' or ')}`,
  })
  type: string;
}
