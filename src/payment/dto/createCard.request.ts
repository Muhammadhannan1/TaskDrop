import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCardDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stripeCustomerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // cardId: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // brand: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // last4: string;

  // @ApiProperty()
  // @IsNumber()
  // @Min(1)
  // @Max(12)
  // expMonth: number;

  // @ApiProperty()
  // @IsNumber()
  // @Min(2023) // Adjust the minimum year depending on the business logic
  // expYear: number;

  // @ApiProperty()
  // @IsBoolean()
  // isDefault: boolean;
}
