import { ConfigService } from '@nestjs/config';

export interface SepayConfig {
  merchantId: string;
  secretKey: string;
  env: 'sandbox' | 'production';
  apiBaseUrl: string;
  checkoutUrl: string;
}

export const getSepayConfig = (configService: ConfigService): SepayConfig => {
  const env =
    (configService.get<string>('SEPAY_ENV') as 'sandbox' | 'production') ||
    'sandbox';

  const baseUrls = {
    sandbox: {
      api: 'https://pgapi-sandbox.sepay.vn',
      checkout: 'https://pay-sandbox.sepay.vn',
    },
    production: {
      api: 'https://pgapi.sepay.vn',
      checkout: 'https://pay.sepay.vn',
    },
  };

  return {
    merchantId: configService.get<string>('SEPAY_MERCHANT_ID', ''),
    secretKey: configService.get<string>('SEPAY_SECRET_KEY', ''),
    env,
    apiBaseUrl: baseUrls[env].api,
    checkoutUrl: `${baseUrls[env].checkout}/v1/checkout/init`,
  };
};
