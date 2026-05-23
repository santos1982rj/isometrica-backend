import { NivelCurso, StatusCurso } from '@prisma/client';
import { z } from 'zod';

export const courseManagementSchema = z.object({
  titulo: z.string().min(3, 'Título obrigatório.'),
  slug: z.string().min(3, 'Slug obrigatório.'),
  descricao: z.string().min(10, 'Descrição obrigatória.'),
  resumo: z.string().optional().nullable(),
  imagem: z.string().optional().nullable(),
  beneficios: z.string().optional().nullable(),
  publicoAlvo: z.string().optional().nullable(),
  isPremium: z.boolean().default(true),
  preco: z.number().nonnegative().optional().nullable(),
  status: z.nativeEnum(StatusCurso).default(StatusCurso.RASCUNHO),
  cargaHoraria: z.number().int().positive().optional().nullable(),
  nivel: z.nativeEnum(NivelCurso).default(NivelCurso.INICIANTE),
  categoria: z.string().optional().nullable(),
});

export const moduleManagementSchema = z.object({
  titulo: z.string().min(3, 'Título obrigatório.'),
  descricao: z.string().optional().nullable(),
  ordem: z.number().int().positive('Ordem obrigatória.'),
});

export const lessonManagementSchema = z.object({
  titulo: z.string().min(3, 'Título obrigatório.'),
  slug: z.string().min(3, 'Slug obrigatório.'),
  descricao: z.string().optional().nullable(),
  conteudo: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  duracao: z.number().int().positive().optional().nullable(),
  ordem: z.number().int().positive('Ordem obrigatória.'),
  isGratuita: z.boolean().default(false),
});

export const exerciseManagementSchema = z.object({
  titulo: z.string().min(3, 'Titulo obrigatorio.'),
  enunciado: z.string().min(10, 'Enunciado obrigatorio.'),
  resolucao: z.string().optional().nullable(),
  dificuldade: z.string().min(3, 'Dificuldade obrigatoria.'),
  xpRecompensa: z
    .number()
    .int()
    .positive('XP obrigatorio.')
    .default(10),
});

export type CourseManagementInput = z.infer<
  typeof courseManagementSchema
>;

export type ModuleManagementInput = z.infer<
  typeof moduleManagementSchema
>;

export type LessonManagementInput = z.infer<
  typeof lessonManagementSchema
>;

export type ExerciseManagementInput = z.infer<
  typeof exerciseManagementSchema
>;
