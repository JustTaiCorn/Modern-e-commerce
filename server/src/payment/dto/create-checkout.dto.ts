import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCheckoutDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsOptional()
  customerId?: string;
}
