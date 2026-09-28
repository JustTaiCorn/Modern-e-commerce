import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Số lượng tồn kho mới', example: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}
