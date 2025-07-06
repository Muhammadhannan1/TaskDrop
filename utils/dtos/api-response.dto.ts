import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class APIResponse {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: any;

  @ApiPropertyOptional()
  @IsOptional()
  testPurpose?: any;
}
