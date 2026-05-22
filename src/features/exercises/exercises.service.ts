import { prisma } from '../../config/prisma';

import { AppError } from '../../core/errors/AppError';

import {
  ensureLessonAccessByExerciseId,
  ensureLessonAccessByLessonId,
} from '../lessons/lesson-access.service';

import type { AuthUser } from '../auth/auth.types';

export async function getLessonExercises(
  lessonId: string,
  actor: AuthUser,
) {
  await ensureLessonAccessByLessonId(actor, lessonId);

  const exercises = await prisma.exercicio.findMany({
    where: {
      aulaId: lessonId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      tentativas: {
        where: {
          userId: actor.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return exercises.map((exercise) => {
    const latestAttempt = exercise.tentativas[0];

    return {
      id: exercise.id,
      titulo: exercise.titulo,
      enunciado: exercise.enunciado,
      dificuldade: exercise.dificuldade,
      xpRecompensa: exercise.xpRecompensa,
      createdAt: exercise.createdAt,
      resolvido: latestAttempt?.correta ?? false,
      ultimaTentativa: latestAttempt ?? null,
    };
  });
}

export async function attemptExercise(
  actor: AuthUser,
  exerciseId: string,
  resposta: string,
  correta: boolean,
) {
  await ensureLessonAccessByExerciseId(actor, exerciseId);

  const exercise = await prisma.exercicio.findUnique({
    where: {
      id: exerciseId,
    },
    select: {
      id: true,
      xpRecompensa: true,
    },
  });

  if (!exercise) {
    throw new AppError('Exercício não encontrado.', 404);
  }

  const existingCorrectAttempt =
    await prisma.tentativaExercicio.findFirst({
      where: {
        userId: actor.id,
        exercicioId: exerciseId,
        correta: true,
      },
    });

  const shouldGrantXp = correta && !existingCorrectAttempt;

  const xpGanho = shouldGrantXp ? exercise.xpRecompensa : 0;

  const attempt = await prisma.tentativaExercicio.create({
    data: {
      userId: actor.id,
      exercicioId: exerciseId,
      resposta,
      correta,
      xpGanho,
    },
  });

  if (shouldGrantXp) {
    await prisma.user.update({
      where: {
        id: actor.id,
      },
      data: {
        xpTotal: {
          increment: xpGanho,
        },
      },
    });
  }

  return attempt;
}
