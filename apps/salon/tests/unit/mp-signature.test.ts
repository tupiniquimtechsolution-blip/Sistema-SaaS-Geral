import { describe, expect, it } from 'vitest';
import {
  hmacSha256Hex,
  mercadoPagoManifest,
  parseMercadoPagoSignature,
  resolveMercadoPagoNotificationDataId,
  verifyMercadoPagoSignature,
} from '../../src/lib/payments/mp-signature';

describe('Mercado Pago official signature', () => {
  it('parses ts/v1 and rejects a raw secret comparison', async () => {
    const secret = 'whsec_test';
    const dataId = '123456';
    const requestId = 'req-1';
    const ts = '1700000000';
    const v1 = await hmacSha256Hex(secret, mercadoPagoManifest(dataId, requestId, ts));
    const header = `ts=${ts},v1=${v1}`;
    expect(parseMercadoPagoSignature(header)).toEqual({ ts, v1 });
    await expect(
      verifyMercadoPagoSignature({ secret, signatureHeader: header, requestId, dataId }),
    ).resolves.toBe(true);
    await expect(
      verifyMercadoPagoSignature({ secret, signatureHeader: secret, requestId, dataId }),
    ).resolves.toBe(false);
  });

  it('uses data.id from the notification URL and rejects a body mismatch', () => {
    const payload = { data: { id: '123456' } };
    const notificationUrl = 'https://example.com/payments-webhook?topic=payment&data.id=123456';

    expect(resolveMercadoPagoNotificationDataId(payload, notificationUrl)).toBe('123456');
    expect(resolveMercadoPagoNotificationDataId({ data: { id: 123456 } })).toBe('123456');
    expect(() =>
      resolveMercadoPagoNotificationDataId(payload, 'https://example.com/payments-webhook?data.id=999999'),
    ).toThrow('webhook_payment_id_mismatch');
  });
});
