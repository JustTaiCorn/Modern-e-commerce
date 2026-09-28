import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Đường Lê Lợi' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ example: 'Phường Bến Nghé' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: 'Quận 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Vietnam' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
