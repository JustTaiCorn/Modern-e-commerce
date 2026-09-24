import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { SepayService, CheckoutFormData } from './sepay.service';
import { SepayIpnDto } from './dto/sepay-ipn.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sepayService: SepayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a SePay checkout session for an existing order.
   * Generates invoiceNumber if not already set, then builds checkout form data.
   */
  async createCheckout(
    orderId: number,
    customerId?: string,
  ): Promise<CheckoutFormData> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Order #${orderId} is not in PENDING status (current: ${order.status})`,
      );
    }

    // Generate invoice number if not set
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = `INV-${Date.now()}-${order.id}`;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { invoiceNumber },
      });
    }

    const clientUrl =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('ALLOWED_ORIGINS')?.split(',')[0] ||
      'http://localhost:5174';

    const formData = this.sepayService.buildCheckoutFormData({
      invoiceNumber,
      amount: Number(order.totalPrice),
      description: `Thanh toan don hang ${invoiceNumber}`,
      successUrl: `${clientUrl}/payment/success?orderId=${order.id}`,
      errorUrl: `${clientUrl}/payment/error?orderId=${order.id}`,
      cancelUrl: `${clientUrl}/payment/cancel?orderId=${order.id}`,
      customerId,
    });

    this.logger.log(
      `Checkout created for order #${orderId} (invoice: ${invoiceNumber})`,
    );

    return formData;
  }

  /**
   * Handle IPN (Instant Payment Notification) from SePay.
   * Verifies the payload and updates order status.
   */
  async handleIpn(payload: SepayIpnDto): Promise<{ success: boolean }> {
    this.logger.log(`IPN received: ${JSON.stringify(payload)}`);

    if (payload.notification_type !== 'ORDER_PAID') {
      this.logger.warn(
        `Unhandled IPN notification type: ${payload.notification_type}`,
      );
      return { success: true };
    }

    const invoiceNumber = payload.order?.order_invoice_number;
    if (!invoiceNumber) {
      this.logger.error('IPN missing order_invoice_number');
      throw new BadRequestException('Missing order_invoice_number');
    }

    // Find order by invoice number
    const order = await this.prisma.order.findUnique({
      where: { invoiceNumber },
    });

    if (!order) {
      this.logger.error(`Order not found for invoice: ${invoiceNumber}`);
      throw new NotFoundException(
        `Order not found for invoice: ${invoiceNumber}`,
      );
    }

    // Skip if already paid
    if (order.status === 'PAID') {
      this.logger.warn(`Order #${order.id} already paid, skipping`);
      return { success: true };
    }

    // Update order to PAID and create PaymentResult
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentResult: {
          create: {
            externalId: payload.transaction?.transaction_id || '',
            status: payload.transaction?.transaction_status || 'APPROVED',
            updateTime:
              payload.transaction?.transaction_date ||
              new Date().toISOString(),
            emailAddress: '',
            provider: 'SEPAY',
          },
        },
      },
    });

    this.logger.log(
      `Order #${order.id} marked as PAID via SePay (transaction: ${payload.transaction?.transaction_id})`,
    );

    return { success: true };
  }
}
