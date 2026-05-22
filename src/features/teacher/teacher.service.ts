import { Role } from '@prisma/client';

import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

import type {
  CourseManagementInput,
  ExerciseManagementInput,
  LessonManagementInput,
  ModuleManagementInput,
} from './teacher.schema';

type Actor = {
  id: string;
  role: Role;
};

function coursePayload(data: CourseManagementInput) {
  return {
    titulo: data.titulo,
    slug: data.slug,
    descricao: data.descricao,
    resumo: data.resumo ?? null,
    imagem: data.imagem ?? null,
    isPremium: data.isPremium,
    preco: data.preco ?? null,
    status: data.status,
    publico: data.status === 'PUBLICADO',
    cargaHoraria: data.cargaHoraria ?? null,
    nivel: data.nivel,
    categoria: data.categoria ?? null,
  };
}

function modulePayload(data: ModuleManagementInput) {
  return {
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    ordem: data.ordem,
  };
}

function lessonPayload(data: LessonManagementInput) {
  return {
    titulo: data.titulo,
    slug: data.slug,
    descricao: data.descricao ?? null,
    conteudo: data.conteudo ?? null,
    videoUrl: data.videoUrl ?? null,
    duracao: data.duracao ?? null,
    ordem: data.ordem,
    isGratuita: data.isGratuita,
  };
}

function exercisePayload(data: ExerciseManagementInput) {
  return {
    titulo: data.titulo,
    enunciado: data.enunciado,
    resolucao: data.resolucao ?? null,
    dificuldade: data.dificuldade,
    xpRecompensa: data.xpRecompensa,
  };
}

function ownedCourseWhere(actor: Actor, courseId: string) {
  if (actor.role === Role.ADMIN) {
    return {
      id: courseId,
    };
  }

  return {
    id: courseId,
    criadoPorId: actor.id,
  };
}

export async function listManagedCourses(actor: Actor) {
  return prisma.curso.findMany({
    ...(actor.role === Role.ADMIN
      ? {}
      : {
          where: {
            criadoPorId: actor.id,
          },
        }),
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      modulos: {
        orderBy: {
          ordem: 'asc',
        },
        include: {
          aulas: {
            orderBy: {
              ordem: 'asc',
            },
          },
        },
      },
    },
  });
}

export async function createManagedCourse(
  actor: Actor,
  data: CourseManagementInput,
) {
  return prisma.curso.create({
    data: {
      ...coursePayload(data),
      criadoPorId: actor.id,
    },
  });
}

export async function updateManagedCourse(
  actor: Actor,
  courseId: string,
  data: CourseManagementInput,
) {
  await ensureCourseAccess(actor, courseId);

  return prisma.curso.update({
    where: {
      id: courseId,
    },
    data: coursePayload(data),
  });
}

export async function createManagedModule(
  actor: Actor,
  courseId: string,
  data: ModuleManagementInput,
) {
  await ensureCourseAccess(actor, courseId);

  return prisma.modulo.create({
    data: {
      ...modulePayload(data),
      cursoId: courseId,
    },
  });
}

export async function updateManagedModule(
  actor: Actor,
  moduleId: string,
  data: ModuleManagementInput,
) {
  const module = await prisma.modulo.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      cursoId: true,
    },
  });

  if (!module) {
    throw new AppError('Módulo não encontrado.', 404);
  }

  await ensureCourseAccess(actor, module.cursoId);

  return prisma.modulo.update({
    where: {
      id: moduleId,
    },
    data: modulePayload(data),
  });
}

export async function createManagedLesson(
  actor: Actor,
  moduleId: string,
  data: LessonManagementInput,
) {
  const module = await prisma.modulo.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      cursoId: true,
    },
  });

  if (!module) {
    throw new AppError('Módulo não encontrado.', 404);
  }

  await ensureCourseAccess(actor, module.cursoId);

  return prisma.aula.create({
    data: {
      ...lessonPayload(data),
      moduloId: moduleId,
    },
  });
}

export async function updateManagedLesson(
  actor: Actor,
  lessonId: string,
  data: LessonManagementInput,
) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      modulo: {
        select: {
          cursoId: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  await ensureCourseAccess(actor, lesson.modulo.cursoId);

  return prisma.aula.update({
    where: {
      id: lessonId,
    },
    data: lessonPayload(data),
  });
}

export async function deleteManagedCourse(
  actor: Actor,
  courseId: string,
) {
  await ensureCourseAccess(actor, courseId);

  await prisma.curso.delete({
    where: {
      id: courseId,
    },
  });
}

export async function deleteManagedModule(
  actor: Actor,
  moduleId: string,
) {
  const module = await prisma.modulo.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      cursoId: true,
    },
  });

  if (!module) {
    throw new AppError('Módulo não encontrado.', 404);
  }

  await ensureCourseAccess(actor, module.cursoId);

  await prisma.modulo.delete({
    where: {
      id: moduleId,
    },
  });
}

export async function deleteManagedLesson(
  actor: Actor,
  lessonId: string,
) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      modulo: {
        select: {
          cursoId: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  await ensureCourseAccess(actor, lesson.modulo.cursoId);

  await prisma.aula.delete({
    where: {
      id: lessonId,
    },
  });
}

export async function createManagedExercise(
  actor: Actor,
  lessonId: string,
  data: ExerciseManagementInput,
) {
  const lesson = await prisma.aula.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      modulo: {
        select: {
          cursoId: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  await ensureCourseAccess(actor, lesson.modulo.cursoId);

  return prisma.exercicio.create({
    data: {
      ...exercisePayload(data),
      aulaId: lessonId,
    },
  });
}

export async function getTeacherKpis(
  actor: Actor,
  periodDays = 30,
) {
  const courseFilter =
    actor.role === Role.ADMIN
      ? {}
      : {
          criadoPorId: actor.id,
        };

  const lessonFilter = {
    modulo: {
      curso: courseFilter,
    },
  };

  const exerciseFilter = {
    aula: {
      modulo: {
        curso: courseFilter,
      },
    },
  };

  const safePeriodDays = [7, 30, 90].includes(periodDays)
    ? periodDays
    : 30;

  const periodStart = new Date(
    Date.now() - safePeriodDays * 24 * 60 * 60 * 1000,
  );
  const previousPeriodStart = new Date(
    periodStart.getTime() - safePeriodDays * 24 * 60 * 60 * 1000,
  );
  const previousPeriodEnd = periodStart;

  const [
    coursesCount,
    modulesCount,
    lessonsCount,
    enrollments,
    activePeriodProgress,
    progressTotal,
    progressCompleted,
    attemptsTotal,
    attemptsCorrect,
    previousActivePeriodProgress,
    previousProgressTotal,
    previousProgressCompleted,
    previousAttemptsTotal,
    previousAttemptsCorrect,
    startedByLesson,
    completedByLesson,
    lessons,
  ] = await Promise.all([
    prisma.curso.count({
      where: courseFilter,
    }),
    prisma.modulo.count({
      where: {
        curso: courseFilter,
      },
    }),
    prisma.aula.count({
      where: lessonFilter,
    }),
    prisma.matricula.findMany({
      where: {
        curso: courseFilter,
      },
      select: {
        progresso: true,
      },
    }),
    prisma.progressoAula.findMany({
      where: {
        aula: lessonFilter,
        updatedAt: {
          gte: periodStart,
        },
      },
      select: {
        userId: true,
      },
    }),
    prisma.progressoAula.count({
      where: {
        aula: lessonFilter,
        updatedAt: {
          gte: periodStart,
        },
      },
    }),
    prisma.progressoAula.count({
      where: {
        aula: lessonFilter,
        concluida: true,
        updatedAt: {
          gte: periodStart,
        },
      },
    }),
    prisma.tentativaExercicio.count({
      where: {
        exercicio: exerciseFilter,
        updatedAt: {
          gte: periodStart,
        },
      },
    }),
    prisma.tentativaExercicio.count({
      where: {
        exercicio: exerciseFilter,
        correta: true,
        updatedAt: {
          gte: periodStart,
        },
      },
    }),
    prisma.progressoAula.findMany({
      where: {
        aula: lessonFilter,
        updatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
      select: {
        userId: true,
      },
    }),
    prisma.progressoAula.count({
      where: {
        aula: lessonFilter,
        updatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    }),
    prisma.progressoAula.count({
      where: {
        aula: lessonFilter,
        concluida: true,
        updatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    }),
    prisma.tentativaExercicio.count({
      where: {
        exercicio: exerciseFilter,
        updatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    }),
    prisma.tentativaExercicio.count({
      where: {
        exercicio: exerciseFilter,
        correta: true,
        updatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    }),
    prisma.progressoAula.groupBy({
      by: ['aulaId'],
      where: {
        aula: lessonFilter,
        updatedAt: {
          gte: periodStart,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.progressoAula.groupBy({
      by: ['aulaId'],
      where: {
        aula: lessonFilter,
        concluida: true,
        updatedAt: {
          gte: periodStart,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.aula.findMany({
      where: lessonFilter,
      select: {
        id: true,
        titulo: true,
        modulo: {
          select: {
            titulo: true,
            curso: {
              select: {
                titulo: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const lessonMetaMap = new Map(
    lessons.map((lesson) => [
      lesson.id,
      {
        titulo: lesson.titulo,
        moduloTitulo: lesson.modulo.titulo,
        cursoTitulo: lesson.modulo.curso.titulo,
      },
    ]),
  );

  const completedMap = new Map(
    completedByLesson.map((row) => [row.aulaId, row._count._all]),
  );

  const dropoffLessons = startedByLesson
    .map((row) => {
      const started = row._count._all;
      const completed = completedMap.get(row.aulaId) ?? 0;
      const dropoff = Math.max(started - completed, 0);
      const completionRate =
        started > 0
          ? Math.round((completed / started) * 100)
          : 0;

      const lessonMeta = lessonMetaMap.get(row.aulaId);

      return {
        lessonId: row.aulaId,
        lessonTitle: lessonMeta?.titulo ?? 'Aula',
        moduleTitle: lessonMeta?.moduloTitulo ?? 'Módulo',
        courseTitle: lessonMeta?.cursoTitulo ?? 'Curso',
        started,
        completed,
        dropoff,
        completionRate,
      };
    })
    .sort((a, b) => b.dropoff - a.dropoff)
    .slice(0, 5);

  const uniqueActivePeriod = new Set(activePeriodProgress.map((p) => p.userId))
    .size;
  const uniqueActivePreviousPeriod = new Set(
    previousActivePeriodProgress.map((p) => p.userId),
  ).size;

  const avgEnrollmentProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, enrollment) => sum + enrollment.progresso, 0) /
            enrollments.length,
        )
      : 0;

  const lessonCompletionRate =
    progressTotal > 0
      ? Math.round((progressCompleted / progressTotal) * 100)
      : 0;
  const previousLessonCompletionRate =
    previousProgressTotal > 0
      ? Math.round((previousProgressCompleted / previousProgressTotal) * 100)
      : 0;

  const exerciseAccuracyRate =
    attemptsTotal > 0
      ? Math.round((attemptsCorrect / attemptsTotal) * 100)
      : 0;
  const previousExerciseAccuracyRate =
    previousAttemptsTotal > 0
      ? Math.round((previousAttemptsCorrect / previousAttemptsTotal) * 100)
      : 0;

  const activeStudentsDelta =
    uniqueActivePeriod - uniqueActivePreviousPeriod;
  const lessonCompletionRateDelta =
    lessonCompletionRate - previousLessonCompletionRate;
  const exerciseAccuracyRateDelta =
    exerciseAccuracyRate - previousExerciseAccuracyRate;

  return {
    overview: {
      courses: coursesCount,
      modules: modulesCount,
      lessons: lessonsCount,
      enrollments: enrollments.length,
    },
    engagement: {
      activeStudents: uniqueActivePeriod,
      periodDays: safePeriodDays,
      avgEnrollmentProgress,
      activeStudentsDelta,
    },
    learning: {
      lessonCompletionRate,
      exerciseAccuracyRate,
      attemptsTotal,
      lessonCompletionRateDelta,
      exerciseAccuracyRateDelta,
    },
    dropoffLessons,
  };
}

async function ensureCourseAccess(actor: Actor, courseId: string) {
  const course = await prisma.curso.findFirst({
    where: ownedCourseWhere(actor, courseId),
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado ou sem permissão.', 404);
  }
}
