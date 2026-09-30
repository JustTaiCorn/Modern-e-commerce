import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Điểm đánh giá từ 1 đến 5 sao',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'Nội dung nhận xét về sản phẩm',
    example: 'Sản phẩm chất lượng rất tốt, đóng gói cẩn thận, giao hàng nhanh!',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
