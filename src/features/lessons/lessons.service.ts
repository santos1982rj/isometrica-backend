import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

export async function getLessonById(lessonId: string) {
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
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  return lesson;
}