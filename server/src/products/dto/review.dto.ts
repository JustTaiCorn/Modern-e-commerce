import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class ReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
