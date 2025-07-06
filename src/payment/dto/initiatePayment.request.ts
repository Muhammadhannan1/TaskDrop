import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { IsObjectId } from 'utils/validators/customValidators';

export class InitiatePaymentDTO {
  @ApiProperty()
  @IsObjectId()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsObjectId()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty()
  @IsObjectId()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payment_methodId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  services: string[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}
