import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { getSepayConfig, SepayConfig } from './sepay.config';

export interface CheckoutFormData {
  checkoutUrl: string;
  fields: Record<string, string>;
}

@Injectable()
export class SepayService {
  private readonly config: SepayConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getSepayConfig(configService);
  }

  /**
   * Generate HMAC-SHA256 signature for SePay checkout form.
   * Only the specified signed fields are included in the signature.
   */
  generateSignature(fields: Record<string, string>): string {
    const signedFieldNames = [
      'merchant',
      'operation',
      'payment_method',
      'order_amount',
      'currency',
      'order_invoice_number',
      'order_description',
      'customer_id',
      'success_url',
      'error_url',
      'cancel_url',
    ];

    const signed: string[] = [];

    for (const field of signedFieldNames) {
      if (fields[field] !== undefined) {
        signed.push(`${field}=${fields[field] ?? ''}`);
      }
    }

    const dataString = signed.join(',');
    const hmac = createHmac('sha256', this.config.secretKey)
      .update(dataString)
      .digest('base64');

    return hmac;
  }

  /**
   * Build checkout form data to be submitted to SePay.
   */
  buildCheckoutFormData(params: {
    invoiceNumber: string;
    amount: number;
    description: string;
    successUrl: string;
    errorUrl: string;
    cancelUrl: string;
    customerId?: string;
  }): CheckoutFormData {
    const fields: Record<string, string> = {
      merchant: this.config.merchantId,
      currency: 'VND',
      order_amount: String(params.amount),
      operation: 'PURCHASE',
      order_description: params.description,
      order_invoice_number: params.invoiceNumber,
      success_url: params.successUrl,
      error_url: params.errorUrl,
      cancel_url: params.cancelUrl,
    };

    if (params.customerId) {
      fields['customer_id'] = params.customerId;
    }

    fields['signature'] = this.generateSignature(fields);

    return {
      checkoutUrl: this.config.checkoutUrl,
      fields,
    };
  }

  /**
   * Get the current SePay environment info.
   */
  getEnvironment() {
    return {
      env: this.config.env,
      checkoutUrl: this.config.checkoutUrl,
      apiBaseUrl: this.config.apiBaseUrl,
    };
  }
}
