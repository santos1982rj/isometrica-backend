import { z } from 'zod';

const nullableText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );

const nullableUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z
    .string()
    .trim()
    .max(500)
    .refine((value) => /^https?:\/\//i.test(value), 'Informe uma URL começando com http:// ou https://.')
    .nullable()
    .optional(),
);

export const updateProfileSchema = z.object({
  nome: z.string().trim().min(2).optional(),
  avatar: nullableText(500),
  headline: nullableText(120),
  location: nullableText(120),
  bio: nullableText(800),
  experience: nullableText(1600),
  education: nullableText(1000),
  skills: nullableText(500),
  interests: nullableText(500),
  linkedinUrl: nullableUrl,
  githubUrl: nullableUrl,
  portfolioUrl: nullableUrl,
  instagramUrl: nullableUrl,
  whatsapp: nullableText(40),
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
