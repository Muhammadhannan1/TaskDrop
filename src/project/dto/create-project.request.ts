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
    @IsMongoId()
    @IsNotEmpty()
    @IsString()
    createdBy: string;

    @ApiProperty()
    @IsArray()
    @ArrayUnique()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    members: string[];
}
