import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId, IsIn } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()

    @IsIn(['Low', 'Medium', 'High'])
    @IsNotEmpty()
    @IsString()
    priority: string;


    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    @IsString()
    projectId: string;


    @ApiProperty()
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    assignedTo: string;

    @ApiProperty()

    @IsNotEmpty()
    @IsIn(['To Do', 'In Progress', 'Done'])
    @IsString()
    status: string;
}
