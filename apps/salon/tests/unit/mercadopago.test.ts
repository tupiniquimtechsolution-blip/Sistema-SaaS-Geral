import { afterEach, describe, expect, it, vi } from 'vitest';
import { MercadoPagoProvider, MERCADO_PAGO_API } from '../../src/lib/payments/mercadopago';
import { hmacSha256Hex, mercadoPagoManifest } from '../../src/lib/payments/mp-signature';

describe('MercadoPagoProvider webhook parsing', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('signs the canonical URL data.id and gets status and amount from Mercado Pago', async () => {
    const secret = 'whsec_test';
    const accessToken = 'access_test';
    const paymentId = '123456';
    const requestId = 'request-42';
    const ts = '1700000000';
    const v1 = await hmacSha256Hex(secret, mercadoPagoManifest(paymentId, requestId, ts));
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 123456,
          status: 'approved',
          transaction_amount: 49.9,
          external_reference: 'appointment-42',
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const provider = new MercadoPagoProvider(accessToken, secret);
    const event = await provider.parseWebhook(
      JSON.stringify({
        id: 'notification-42',
        action: 'payment.updated',
        data: { id: paymentId, status: 'rejected', transaction_amount: 0.01 },
      }),
      { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId },
      `https://example.com/payments-webhook?topic=payment&data.id=${paymentId}`,
    );

    expect(fetchMock).toHaveBeenCalledWith(`${MERCADO_PAGO_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(event).toMatchObject({
      eventId: 'notification-42',
      provider: 'mercadopago',
      providerRef: paymentId,
      status: 'paid',
      amountCents: 4990,
    });
  });

  it('rejects different URL and body data.id values before lookup', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const provider = new MercadoPagoProvider('access_test', 'whsec_test');

    await expect(
      provider.parseWebhook(
        JSON.stringify({ data: { id: '123456' } }),
        { 'x-signature': 'ts=1700000000,v1=ignored', 'x-request-id': 'request-42' },
        'https://example.com/payments-webhook?data.id=654321',
      ),
    ).rejects.toThrow('webhook_payment_id_mismatch');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
