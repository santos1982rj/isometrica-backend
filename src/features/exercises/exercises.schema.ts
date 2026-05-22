import { z } from 'zod';

/**
 * Schema de validação para tentativa de exercício.
 *
 * Compatível com a versão atual do Zod usada no projeto,
 * sem uso de `required_error`.
 */
export const attemptExerciseSchema = z.object({
  resposta: z
    .string()
    .min(1, 'Resposta obrigatória.'),

  correta: z.boolean(),
});

export type AttemptExerciseInput =
  z.infer<typeof attemptExerciseSchema>;