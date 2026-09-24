import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SaveShippingDetailsDto } from './dto/save-shipping-details.dto';
import { SavePaymentMethodDto } from './dto/save-payment-method.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(AccessTokenGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addToCart(@Body() dto: AddToCartDto, @CurrentUser() user: any) {
    return this.cartService.addCartItem(user.userId, dto.variantId, dto.qty);
  }

  @Put('items/:variantId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateCartItem(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body('qty', ParseIntPipe) qty: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.updateCartItemQty(user.userId, variantId, qty);
  }

  @Delete('items/:variantId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeFromCart(
    @Param('variantId', ParseIntPipe) variantId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.removeCartItem(user.userId, variantId);
  }

  @Post('shipping')
  @ApiOperation({ summary: 'Save shipping details' })
  saveShipping(@Body() dto: SaveShippingDetailsDto, @CurrentUser() user: any) {
    return this.cartService.saveShipping(user.userId, dto);
  }

  @Post('payment')
  @ApiOperation({ summary: 'Save payment method' })
  savePayment(@Body() dto: SavePaymentMethodDto, @CurrentUser() user: any) {
    return this.cartService.savePaymentMethod(user.userId, dto.paymentMethod);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.userId);
  }
}
