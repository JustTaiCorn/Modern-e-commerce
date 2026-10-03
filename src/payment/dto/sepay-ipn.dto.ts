import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SepayIpnOrderDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsString()
  order_status?: string;

  @IsOptional()
  @IsString()
  order_currency?: string;

  @IsOptional()
  @IsString()
  order_amount?: string;

  @IsOptional()
  @IsString()
  order_invoice_number?: string;

  @IsOptional()
  order_description?: string;
}

export class SepayIpnTransactionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  transaction_type?: string;

  @IsOptional()
  @IsString()
  transaction_date?: string;

  @IsOptional()
  @IsString()
  transaction_status?: string;

  @IsOptional()
  @IsString()
  transaction_amount?: string;

  @IsOptional()
  @IsString()
  transaction_currency?: string;
}

export class SepayIpnDto {
  @IsOptional()
  timestamp?: number;

  @IsOptional()
  @IsString()
  notification_type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SepayIpnOrderDto)
  order?: SepayIpnOrderDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SepayIpnTransactionDto)
  transaction?: SepayIpnTransactionDto;

  @IsOptional()
  customer?: any;

  @IsOptional()
  agreement?: any;
}
