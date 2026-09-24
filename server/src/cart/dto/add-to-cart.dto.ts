import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  @IsNotEmpty()
  variantId: number;

  @IsNumber()
  @IsNotEmpty()
  qty: number;
}
