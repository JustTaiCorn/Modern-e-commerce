import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { SaveShippingDetailsDto } from 'src/cart/dto/save-shipping-details.dto';

export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  variantId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  qty: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => SaveShippingDetailsDto)
  shippingDetails: SaveShippingDetailsDto;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  itemsPrice: number;

  @IsNumber()
  @IsNotEmpty()
  taxPrice: number;

  @IsNumber()
  @IsNotEmpty()
  shippingPrice: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}
