import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { validateMercadoPagoWebhookSignature } from './payments.controller';

describe('Mercado Pago webhook signature', () => {
  it('validates x-signature using payment id, request id and timestamp', () => {
    const paymentId = '12345';
    const requestId = 'request-id';
    const timestamp = '1710000000';
    const secret = 'webhook-secret';
    const hash = createHmac('sha256', secret)
      .update(`id:${paymentId};request-id:${requestId};ts:${timestamp};`)
      .digest('hex');
    const request = {
      header: (name: string) => ({
        'x-signature': `ts=${timestamp},v1=${hash}`,
        'x-request-id': requestId,
      }[name]),
    };

    expect(validateMercadoPagoWebhookSignature(
      request as never,
      paymentId,
      secret,
    )).toBe(true);
    expect(validateMercadoPagoWebhookSignature(
      request as never,
      paymentId,
      'wrong-secret',
    )).toBe(false);
  });
});
