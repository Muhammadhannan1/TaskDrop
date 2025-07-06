import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, ArrayUnique, IsArray } from 'class-validator';

export class UpdateProjectDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsArray()
    @ArrayUnique()
    @IsMongoId({ each: true })
    @IsOptional()
    members?: string[];
}
