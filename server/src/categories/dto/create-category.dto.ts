import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', minLength: 2, maxLength: 128 })
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name: string;

  @ApiPropertyOptional({
    example: 'electronics',
    description: 'Auto-generated from name if omitted',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  slug?: string;

  @ApiPropertyOptional({ example: 'All electronic devices' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cat.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
