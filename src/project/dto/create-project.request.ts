import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsMongoId, ArrayUnique, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;


    @ApiProperty()
    @IsNotEmpty()
    @IsMongoId()
    createdBy: string;

    @ApiProperty()
    @IsArray()
    @ArrayUnique()
    @ArrayNotEmpty()
    members: string[];
}
