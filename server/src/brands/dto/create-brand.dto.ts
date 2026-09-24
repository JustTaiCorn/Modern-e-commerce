import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple', minLength: 2, maxLength: 128 })
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;

  @ApiPropertyOptional({ example: 'apple', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/apple-logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
