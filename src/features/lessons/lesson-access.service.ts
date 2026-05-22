import { Role } from '@prisma/client';

import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

type Actor = {
  id: string;
  role: Role;
};

type LessonAccessContext = {
  id: string;
  isGratuita: boolean;
  modulo: {
    curso: {
      id: string;
      isPremium: boolean;
      criadoPorId: string | null;
    };
  };
};

export async function ensureLessonAccessByLessonId(
  actor: Actor,
  lessonId: string,
) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      isGratuita: true,
      modulo: {
        select: {
          curso: {
            select: {
              id: true,
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

  await ensureLessonAccess(actor, lesson);

  return lesson;
}

export async function hasLessonAccess(
  actor: Actor | undefined,
  lesson: LessonAccessContext,
) {
  const course = lesson.modulo.curso;

  if (lesson.isGratuita) {
    return true;
  }

  if (!actor) {
    return false;
  }

  if (!course.isPremium) {
    return true;
  }

  if (actor.role === Role.ADMIN) {
    return true;
  }

  if (actor.role === Role.PROFESSOR && course.criadoPorId === actor.id) {
    return true;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: actor.id,
    },
    select: {
      hasActiveSub: true,
      subExpiresAt: true,
    },
  });

  const subscriptionIsActive =
    user?.hasActiveSub === true &&
    (!user.subExpiresAt || user.subExpiresAt > new Date());

  if (subscriptionIsActive) {
    return true;
  }

  const enrollment = await prisma.matricula.findUnique({
    where: {
      userId_cursoId: {
        userId: actor.id,
        cursoId: course.id,
      },
    },
    select: {
      id: true,
    },
  });

  return !!enrollment;
}

export async function ensureLessonAccessByExerciseId(
  actor: Actor,
  exerciseId: string,
) {
  const exercise = await prisma.exercicio.findUnique({
    where: {
      id: exerciseId,
    },
    select: {
      aula: {
        select: {
          id: true,
          isGratuita: true,
          modulo: {
            select: {
              curso: {
                select: {
                  id: true,
                  isPremium: true,
                  criadoPorId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exercise) {
    throw new AppError('Exercício não encontrado.', 404);
  }

  await ensureLessonAccess(actor, exercise.aula);

  return exercise.aula;
}

async function ensureLessonAccess(
  actor: Actor,
  lesson: LessonAccessContext,
) {
  if (await hasLessonAccess(actor, lesson)) {
    return;
  }

  throw new AppError(
    'Esta aula faz parte de um curso premium. Faça a matrícula para continuar.',
    403,
  );
}
