import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'johndoe', minLength: 3, maxLength: 128 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  username?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;
}
