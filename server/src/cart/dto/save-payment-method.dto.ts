import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SavePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PayPal', 'Stripe'])
  paymentMethod: string;
}
