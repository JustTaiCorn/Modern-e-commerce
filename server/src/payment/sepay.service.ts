import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SePayPgClient } from 'sepay-pg-node';
import { getSepayConfig } from './sepay.config';

export interface CheckoutFormData {
  checkoutUrl: string;
  fields: Record<string, string | number>;
}

@Injectable()
export class SepayService {
  private readonly client: SePayPgClient;
  private readonly checkoutUrl: string;

  constructor(private readonly configService: ConfigService) {
    const config = getSepayConfig(configService);

    this.client = new SePayPgClient({
      env: config.env,
      merchant_id: config.merchantId,
      secret_key: config.secretKey,
    });

    this.checkoutUrl = this.client.checkout.initCheckoutUrl();
  }

  /**
   * Build checkout form data to be submitted to SePay.
   * Note: SePay gateway does NOT accept notify_url in the checkout form.
   * IPN webhook URL must be configured directly on my.sepay.vn dashboard.
   */
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
      checkoutUrl: this.checkoutUrl,
      fields,
    };
  }

  /**
   * Get the current SePay environment info.
   */
  getEnvironment() {
    const config = getSepayConfig(this.configService);
    return {
      env: config.env,
      checkoutUrl: this.checkoutUrl,
      apiBaseUrl: config.apiBaseUrl,
    };
  }
}
