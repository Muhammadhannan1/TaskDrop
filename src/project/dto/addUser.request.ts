import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, IsEmail } from 'class-validator';

export class addUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    @IsString()
    projectId: string;
}
