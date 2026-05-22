import { z } from 'zod';

export const createPaymentPreferenceSchema = z.object({
  courseId: z.string().uuid('courseId invalido.'),
});

export const processTransparentPaymentSchema = z.object({
  courseId: z.string().uuid('courseId invalido.'),
  paymentAttemptId: z.string().uuid('paymentAttemptId invalido.'),
  token: z.string().trim().min(1, 'Token do cartao invalido.').optional(),
  transaction_amount: z.number().optional(),
  installments: z.number().int().min(1).max(48).optional(),
  payment_method_id: z.string().trim().min(1, 'Metodo de pagamento invalido.'),
  issuer_id: z.string().trim().min(1).nullable().optional(),
  payer: z.object({
    email: z.string().trim().email('E-mail do pagador invalido.'),
    identification: z.object({
      type: z.string().trim().min(1).optional(),
      number: z.string().trim().min(1).optional(),
    }).optional(),
    first_name: z.string().trim().min(1).optional(),
    last_name: z.string().trim().min(1).optional(),
    address: z.record(z.string(), z.unknown()).optional(),
  }).passthrough(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  transaction_details: z.record(z.string(), z.unknown()).optional(),
  additional_info: z.record(z.string(), z.unknown()).optional(),
});

export type ProcessTransparentPaymentInput = z.infer<typeof processTransparentPaymentSchema>;
