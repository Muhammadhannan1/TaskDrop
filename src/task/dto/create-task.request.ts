import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId, IsIn } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsIn(['low', 'medium', 'high'])
    @IsNotEmpty()
    @IsString()
    priority: string;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    @IsString()
    assignedTo?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsIn(['todo', 'in_progress', 'done'])
    @IsString()
    status: string;
}
