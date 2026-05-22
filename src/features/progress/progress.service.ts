import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';
import { ensureLessonAccessByLessonId } from '../lessons/lesson-access.service';

import type { AuthUser } from '../auth/auth.types';

export async function completeLesson(
  actor: AuthUser,
  lessonId: string,
) {
  await ensureLessonAccessByLessonId(actor, lessonId);

  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      modulo: {
        select: {
          cursoId: true,
          curso: {
            select: {
              modulos: {
                select: {
                  aulas: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  const existingProgress =
    await prisma.progressoAula.findUnique({
      where: {
        userId_aulaId: {
          userId: actor.id,
          aulaId: lessonId,
        },
      },
    });

  const alreadyCompleted =
    existingProgress?.concluida === true;

  const progress =
    await prisma.progressoAula.upsert({
      where: {
        userId_aulaId: {
          userId: actor.id,
          aulaId: lessonId,
        },
      },
      update: {
        concluida: true,
        concluidaEm:
          existingProgress?.concluidaEm ?? new Date(),
      },
      create: {
        userId: actor.id,
        aulaId: lessonId,
        concluida: true,
        concluidaEm: new Date(),
      },
    });

  if (!alreadyCompleted) {
    await prisma.user.update({
      where: {
        id: actor.id,
      },
      data: {
        xpTotal: {
          increment: 20,
        },
      },
    });
  }

  const totalLessons =
    lesson.modulo.curso.modulos.flatMap(
      (module) => module.aulas,
    ).length;

  const completedLessons =
    await prisma.progressoAula.count({
      where: {
        userId: actor.id,
        concluida: true,
        aula: {
          modulo: {
            cursoId: lesson.modulo.cursoId,
          },
        },
      },
    });

  const percentage =
    totalLessons > 0
      ? (completedLessons / totalLessons) * 100
      : 0;

  await prisma.matricula.updateMany({
    where: {
      userId: actor.id,
      cursoId: lesson.modulo.cursoId,
    },
    data: {
      progresso: percentage,
      concluido: percentage >= 100,
      dataConclusao:
        percentage >= 100
          ? new Date()
          : null,
    },
  });

  return progress;
}

export async function updateLessonWatchTime(
  actor: AuthUser,
  lessonId: string,
  tempoAssistido: number,
) {
  if (!Number.isInteger(tempoAssistido) || tempoAssistido < 0) {
    throw new AppError('Tempo assistido inválido.', 400);
  }

  await ensureLessonAccessByLessonId(actor, lessonId);

  const progress = await prisma.progressoAula.upsert({
    where: {
      userId_aulaId: {
        userId: actor.id,
        aulaId: lessonId,
      },
    },
    update: {
      tempoAssistido,
    },
    create: {
      userId: actor.id,
      aulaId: lessonId,
      tempoAssistido,
      concluida: false,
    },
  });

  return progress;
}

export async function updateLessonNotes(
  actor: AuthUser,
  lessonId: string,
  notas: string,
) {
  await ensureLessonAccessByLessonId(actor, lessonId);

  const progress = await prisma.progressoAula.upsert({
    where: {
      userId_aulaId: {
        userId: actor.id,
        aulaId: lessonId,
      },
    },
    update: {
      notas,
    },
    create: {
      userId: actor.id,
      aulaId: lessonId,
      notas,
      concluida: false,
    },
  });

  return progress;
}

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
      notas: true,
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
