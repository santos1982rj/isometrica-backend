import { describe, expect, it } from 'vitest';

import { mapPaymentStatus } from './payments.service';

describe('payment status mapping', () => {
  it('maps Mercado Pago statuses to local transaction statuses', () => {
    expect(mapPaymentStatus('approved')).toBe('APROVADO');
    expect(mapPaymentStatus('rejected')).toBe('RECUSADO');
    expect(mapPaymentStatus('refunded')).toBe('ESTORNADO');
    expect(mapPaymentStatus('charged_back')).toBe('ESTORNADO');
    expect(mapPaymentStatus('in_process')).toBe('PENDENTE');
  });
});
