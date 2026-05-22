import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

import { hasLessonAccess } from './lesson-access.service';

import type { AuthUser } from '../auth/auth.types';

export async function getLessonById(
  lessonId: string,
  actor?: AuthUser,
) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      conteudo: true,
      videoUrl: true,
      duracao: true,
      ordem: true,
      isGratuita: true,
      modulo: {
        select: {
          id: true,
          titulo: true,
          curso: {
            select: {
              id: true,
              titulo: true,
              slug: true,
              isPremium: true,
              criadoPorId: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  const canAccess = await hasLessonAccess(actor, {
    id: lesson.id,
    isGratuita: lesson.isGratuita,
    modulo: {
      curso: {
        id: lesson.modulo.curso.id,
        isPremium: lesson.modulo.curso.isPremium,
        criadoPorId: lesson.modulo.curso.criadoPorId,
      },
    },
  });
  const { criadoPorId, ...course } = lesson.modulo.curso;

  return {
    ...lesson,
    conteudo: canAccess ? lesson.conteudo : null,
    videoUrl: canAccess ? lesson.videoUrl : null,
    locked: !canAccess,
    modulo: {
      ...lesson.modulo,
      curso: course,
    },
  };
}
