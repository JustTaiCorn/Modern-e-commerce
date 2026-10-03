import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentResultDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  updateTime: string;

  @IsString()
  @IsNotEmpty()
  emailAddress: string;
}
