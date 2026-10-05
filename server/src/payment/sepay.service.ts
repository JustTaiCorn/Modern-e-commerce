import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SePayPgClient } from 'sepay-pg-node';

export interface CheckoutFormData {
  checkoutUrl: string;
  fields: Record<string, string | number>;
}

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);
  private readonly client: SePayPgClient;

  constructor(private readonly configService: ConfigService) {
    const env = (this.configService.get<string>('SEPAY_ENV') ?? '')
      .trim()
      .toLowerCase();
    const merchantId = this.configService.get<string>('SEPAY_MERCHANT_ID');
    const secretKey = this.configService.get<string>('SEPAY_SECRET_KEY');

    // Không fallback ngầm sang sandbox nữa: thiếu hoặc sai thì báo lỗi ngay khi khởi động
    if (env !== 'sandbox' && env !== 'production') {
      throw new Error(
        `SEPAY_ENV phải là "sandbox" hoặc "production", hiện tại: "${env}"`,
      );
    }
    if (!merchantId || !secretKey) {
      throw new Error('Thiếu SEPAY_MERCHANT_ID hoặc SEPAY_SECRET_KEY');
    }

    this.client = new SePayPgClient({
      env,
      merchant_id: merchantId.trim(),
      secret_key: secretKey.trim(),
    });

    this.logger.log(
      `SePay env=${env}, checkout=${this.client.checkout.initCheckoutUrl()}`,
    );
  }

  buildCheckoutFormData(params: {
    invoiceNumber: string;
    amount: number;
    description: string;
    successUrl: string;
    errorUrl: string;
    cancelUrl: string;
    paymentMethod?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
    customerId?: string;
  }): CheckoutFormData {
    const fields = this.client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      order_invoice_number: params.invoiceNumber,
      order_amount: Math.round(params.amount),
      currency: 'VND',
      order_description: params.description,
      ...(params.paymentMethod && { payment_method: params.paymentMethod }),
      ...(params.customerId && { customer_id: params.customerId }),
      success_url: params.successUrl,
      error_url: params.errorUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      // Lấy URL từ SDK mỗi lần gọi, đúng như docs
      checkoutUrl: this.client.checkout.initCheckoutUrl(),
      fields,
    };
  }
}
