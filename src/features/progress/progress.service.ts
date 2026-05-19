import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

/**
 * Marca uma aula como concluída para o usuário autenticado.
 *
 * @param userId ID do usuário autenticado.
 * @param lessonId ID da aula.
 * @returns Registro de progresso criado ou atualizado.
 * @throws AppError quando a aula não existe.
 */
export async function completeLesson(userId: string, lessonId: string) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  const progress = await prisma.progressoAula.upsert({
    where: {
      userId_aulaId: {
        userId,
        aulaId: lessonId,
      },
    },
    update: {
      concluida: true,
      concluidaEm: new Date(),
    },
    create: {
      userId,
      aulaId: lessonId,
      concluida: true,
      concluidaEm: new Date(),
    },
  });

  return progress;
}

/**
 * Lista o progresso de aulas do usuário autenticado.
 *
 * @param userId ID do usuário autenticado.
 * @returns Lista de aulas concluídas ou iniciadas.
 */
export async function getStudentProgress(userId: string) {
  const progress = await prisma.progressoAula.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      aulaId: true,
      concluida: true,
      tempoAssistido: true,
      concluidaEm: true,
      aula: {
        select: {
          id: true,
          titulo: true,
          slug: true,
          modulo: {
            select: {
              id: true,
              titulo: true,
              curso: {
                select: {
                  id: true,
                  titulo: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return progress;
}