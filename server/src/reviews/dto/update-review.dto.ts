import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Điểm đánh giá mới từ 1 đến 5 sao',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Nội dung nhận xét cập nhật',
    example: 'Sau một thời gian sử dụng thấy sản phẩm vẫn dùng rất tốt.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
