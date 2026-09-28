import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER2026', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code: string;

  @ApiProperty({ example: 'Giảm giá mùa hè', maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiPropertyOptional({ example: 'Mã giảm giá áp dụng toàn sàn' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @IsNumber()
  minOrderTotal?: number;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/coupon.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
