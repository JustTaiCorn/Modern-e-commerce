import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SepayIpnDto } from './dto/sepay-ipn.dto';

@ApiTags('Payment')
@Controller('payment/sepay')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a checkout session for SePay payment.
   * Returns form data that the frontend should POST to SePay's checkout URL.
   */
  @Post('checkout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create SePay checkout session',
    description:
      'Returns checkout URL and form fields for the frontend to submit to SePay',
  })
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.createCheckout(
      dto.orderId,
      dto.customerId || `USER_${user.userId}`,
    );
  }

  /**
   * IPN (Instant Payment Notification) endpoint.
   * Called by SePay when a payment is completed.
   * This endpoint is PUBLIC - no auth guard.
   */
  @Post('ipn')
  @ApiOperation({
    summary: 'SePay IPN webhook',
    description:
      'Receives payment notifications from SePay. Public endpoint - no authentication required.',
  })
  async handleIpn(@Body() payload: SepayIpnDto) {
    return this.paymentService.handleIpn(payload);
  }

  /**
   * Success callback - redirect to frontend success page.
   */
  @Get('success')
  @ApiOperation({ summary: 'Payment success redirect' })
  async handleSuccess(
    @Query('orderId') orderId: string,
    @Res() res: Response,
  ) {
    const clientUrl = this.getClientUrl();
    return res.redirect(
      `${clientUrl}/payment/success?orderId=${orderId || ''}`,
    );
  }

  /**
   * Error callback - redirect to frontend error page.
   */
  @Get('error')
  @ApiOperation({ summary: 'Payment error redirect' })
  async handleError(@Query('orderId') orderId: string, @Res() res: Response) {
    const clientUrl = this.getClientUrl();
    return res.redirect(
      `${clientUrl}/payment/error?orderId=${orderId || ''}`,
    );
  }

  /**
   * Cancel callback - redirect to frontend cancel page.
   */
  @Get('cancel')
  @ApiOperation({ summary: 'Payment cancel redirect' })
  async handleCancel(@Query('orderId') orderId: string, @Res() res: Response) {
    const clientUrl = this.getClientUrl();
    return res.redirect(
      `${clientUrl}/payment/cancel?orderId=${orderId || ''}`,
    );
  }

  private getClientUrl(): string {
    return (
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('ALLOWED_ORIGINS')?.split(',')[0] ||
      'http://localhost:5174'
    );
  }
}
