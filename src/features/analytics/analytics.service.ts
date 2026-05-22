import { prisma } from '../../config/prisma';

/**
 * Busca o resumo acadêmico do aluno autenticado.
 *
 * Utilizado no dashboard principal para exibir indicadores consolidados:
 * - XP total;
 * - nível;
 * - streak;
 * - aulas concluídas;
 * - cursos em andamento;
 * - cursos concluídos;
 * - tempo total de estudo.
 *
 * @param userId ID do usuário autenticado.
 * @returns Indicadores acadêmicos consolidados do aluno.
 */
export async function getStudentAnalytics(userId: string) {
  const [user, completedLessons, enrollments, progressRecords] =
    await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          xpTotal: true,
          nivel: true,
          streak: true,
        },
      }),

      prisma.progressoAula.count({
        where: {
          userId,
          concluida: true,
        },
      }),

      prisma.matricula.findMany({
        where: {
          userId,
        },
        select: {
          progresso: true,
          concluido: true,
        },
      }),

      prisma.progressoAula.findMany({
        where: {
          userId,
        },
        select: {
          tempoAssistido: true,
        },
      }),
    ]);

  const tempoTotalEstudo = progressRecords.reduce(
    (total, progress) => total + (progress.tempoAssistido ?? 0),
    0,
  );

  const cursosEmAndamento = enrollments.filter(
    (enrollment) => !enrollment.concluido,
  ).length;

  const cursosConcluidos = enrollments.filter(
    (enrollment) => enrollment.concluido,
  ).length;

  return {
    xpTotal: user?.xpTotal ?? 0,
    nivel: user?.nivel ?? 1,
    streak: user?.streak ?? 0,
    aulasConcluidas: completedLessons,
    cursosEmAndamento,
    cursosConcluidos,
    tempoTotalEstudo,
  };
}

/**
 * Busca o progresso semanal do aluno autenticado.
 *
 * Utilizado para alimentar visualizações futuras no dashboard:
 * - heatmap de estudo;
 * - mini gráficos de evolução;
 * - cards de XP semanal;
 * - gamificação acadêmica.
 *
 * @param userId ID do usuário autenticado.
 * @returns Dados de progresso dos últimos 7 dias disponíveis no banco.
 */
export async function getWeeklyAnalytics(userId: string) {
  const today = new Date();

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(today.getDate() - 6);

  const dailyProgress = await prisma.progressoDiario.findMany({
    where: {
      userId,
      data: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      data: 'asc',
    },
  });

  return dailyProgress.map((day) => ({
    data: day.data,
    xpGanho: day.xpGanho,
    exercicios: day.exercicios,
    calculos: day.calculos,
  }));
}