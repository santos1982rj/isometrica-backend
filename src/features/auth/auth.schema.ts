import { z } from 'zod';

export const registerSchema = z.object({
  nome: z.string().trim().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  email: z.string().trim().email('E-mail inválido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  acceptTerms: z.literal(true, {
    error: 'Aceite os termos para criar a conta.',
  }),
  acceptPrivacy: z.literal(true, {
    error: 'Aceite a política de privacidade para criar a conta.',
  }),
  marketingConsent: z.boolean().optional().default(false),
  trackingConsent: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('E-mail inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Token inválido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32, 'Token inválido.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
