import { describe, expect, it } from 'vitest';

import {
  createPaymentPreferenceSchema,
  processTransparentPaymentSchema,
} from './payments.schema';

describe('payment schemas', () => {
  it('accepts a valid transparent payment payload', () => {
    const result = processTransparentPaymentSchema.safeParse({
      courseId: '534a8bf0-8872-497d-b14f-7f4f4ab41c97',
      paymentAttemptId: '011864b8-c8b6-4a0e-868a-54f53cc2c069',
      token: 'card-token',
      installments: 1,
      payment_method_id: 'master',
      issuer_id: '24',
      payer: {
        email: 'aluno@example.com',
        identification: {
          type: 'CPF',
          number: '12345678909',
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it('accepts a pix or ticket payment payload without card data', () => {
    const result = processTransparentPaymentSchema.safeParse({
      courseId: '534a8bf0-8872-497d-b14f-7f4f4ab41c97',
      paymentAttemptId: '011864b8-c8b6-4a0e-868a-54f53cc2c069',
      payment_method_id: 'pix',
      payer: {
        email: 'aluno@example.com',
        identification: {
          type: 'CPF',
          number: '12345678909',
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects malformed payment and preference payloads', () => {
    expect(createPaymentPreferenceSchema.safeParse({ courseId: 'course' }).success)
      .toBe(false);
    expect(processTransparentPaymentSchema.safeParse({
      courseId: 'course',
      token: '',
      installments: 0,
      payment_method_id: '',
      payer: { email: 'invalid' },
    }).success).toBe(false);
  });
});
