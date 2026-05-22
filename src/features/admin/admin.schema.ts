import { Role, StatusCurso, StatusUsuario } from '@prisma/client';
import { z } from 'zod';

export const updateUserAccessSchema = z.object({
  role: z.nativeEnum(Role),
  status: z.nativeEnum(StatusUsuario),
});

export type UpdateUserAccessInput = z.infer<
  typeof updateUserAccessSchema
>;

export const updateCourseStatusSchema = z.object({
  status: z.nativeEnum(StatusCurso),
});

export type UpdateCourseStatusInput = z.infer<
  typeof updateCourseStatusSchema
>;

export const updateCourseCommercialSchema = z.object({
  isPremium: z.boolean(),
  preco: z.number().min(0).nullable(),
});

export type UpdateCourseCommercialInput = z.infer<
  typeof updateCourseCommercialSchema
>;

const nullableCourseCopy = z
  .string()
  .trim()
  .max(2400)
  .transform((value) => value || null);

export const updateCourseSalesSchema = z.object({
  resumo: nullableCourseCopy,
  imagem: z
    .string()
    .trim()
    .max(2048)
    .transform((value) => value || null)
    .refine((value) => value === null || URL.canParse(value), 'Informe uma URL valida para a capa.'),
  beneficios: nullableCourseCopy,
  publicoAlvo: nullableCourseCopy,
});

export type UpdateCourseSalesInput = z.infer<typeof updateCourseSalesSchema>;

export const updateLessonPreviewSchema = z.object({
  isGratuita: z.boolean(),
});

export type UpdateLessonPreviewInput = z.infer<typeof updateLessonPreviewSchema>;

const optionalTrackingId = (pattern: RegExp, message: string) =>
  z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || null)
    .refine((value) => value === null || pattern.test(value), message);

export const updateTrackingSettingsSchema = z.object({
  googleTagManagerId: optionalTrackingId(
    /^GTM-[A-Z0-9]+$/i,
    'Informe um ID valido do Google Tag Manager.',
  ),
  googleAnalyticsMeasurementId: optionalTrackingId(
    /^G-[A-Z0-9]+$/i,
    'Informe um Measurement ID valido do Google Analytics.',
  ),
  metaPixelId: optionalTrackingId(
    /^\d+$/,
    'Informe um Pixel ID numerico da Meta.',
  ),
});

export type UpdateTrackingSettingsInput = z.infer<
  typeof updateTrackingSettingsSchema
>;
