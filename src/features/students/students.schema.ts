import { z } from 'zod';

export const updateProfileSchema = z.object({
  nome: z.string().trim().min(2).optional(),
  avatar: z.string().trim().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const updatePreferencesSchema = z.object({
  marketingConsent: z.boolean(),
  trackingConsent: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
