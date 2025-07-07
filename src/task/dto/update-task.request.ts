import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, IsIn } from 'class-validator';

export class UpdateTaskDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    @IsString()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsIn(['low', 'medium', 'high'])
    @IsString()
    priority?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    @IsString()
    assignedTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsIn(['todo', 'in_progress', 'done'])
    @IsString()
    status?: string;
} 