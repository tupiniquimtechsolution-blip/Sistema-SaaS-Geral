import { DemoProvider } from './demo';
import { MercadoPagoProvider } from './mercadopago';
import type { PaymentProvider } from './provider';

export * from './provider';
export * from './demo';
export * from './mercadopago';
export * from './mp-signature';

export function getPaymentProvider(env: Record<string, string | undefined> = {}): PaymentProvider {
  const name = (env.PAYMENT_PROVIDER ?? 'demo').toLowerCase();
  if (name === 'mercadopago') {
    return new MercadoPagoProvider(env.MERCADOPAGO_ACCESS_TOKEN ?? '', env.MERCADOPAGO_WEBHOOK_SECRET ?? '');
  }
  return new DemoProvider();
}
