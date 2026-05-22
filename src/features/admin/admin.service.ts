import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

import type {
  UpdateCourseCommercialInput,
  UpdateCourseSalesInput,
  UpdateLessonPreviewInput,
  UpdateCourseStatusInput,
  UpdateTrackingSettingsInput,
  UpdateUserAccessInput,
} from './admin.schema';

const PLATFORM_SETTINGS_ID = 'platform';

export async function getAdminOverview() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalCourses,
    publicCourses,
    totalModules,
    totalLessons,
    totalTransactions,
    approvedTransactions,
    pendingTransactions,
    rejectedTransactions,
    refundedTransactions,
    approvedRevenueResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ALUNO' } }),
    prisma.user.count({ where: { role: 'PROFESSOR' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.curso.count(),
    prisma.curso.count({ where: { publico: true } }),
    prisma.modulo.count(),
    prisma.aula.count(),
    prisma.transacao.count(),
    prisma.transacao.count({ where: { status: 'APROVADO' } }),
    prisma.transacao.count({ where: { status: 'PENDENTE' } }),
    prisma.transacao.count({ where: { status: 'RECUSADO' } }),
    prisma.transacao.count({ where: { status: 'ESTORNADO' } }),
    prisma.transacao.aggregate({
      where: { status: 'APROVADO' },
      _sum: { valorTotal: true },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      admins: totalAdmins,
    },
    content: {
      courses: totalCourses,
      publicCourses,
      modules: totalModules,
      lessons: totalLessons,
    },
    payments: {
      transactions: totalTransactions,
      approved: approvedTransactions,
      pending: pendingTransactions,
      rejected: rejectedTransactions,
      refunded: refundedTransactions,
      approvedRevenue: approvedRevenueResult._sum.valorTotal ?? 0,
    },
  };
}

export async function listAdminUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      status: true,
      xpTotal: true,
      nivel: true,
      hasActiveSub: true,
      subExpiresAt: true,
      createdAt: true,
    },
  });
}

export async function listAdminCourses() {
  return prisma.curso.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      publico: true,
      isPremium: true,
      preco: true,
      resumo: true,
      imagem: true,
      beneficios: true,
      publicoAlvo: true,
      nivel: true,
      categoria: true,
      criadoPor: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      modulos: {
        select: {
          id: true,
          titulo: true,
          aulas: {
            select: {
              id: true,
              titulo: true,
              conteudo: true,
              videoUrl: true,
              isGratuita: true,
            },
          },
        },
      },
      updatedAt: true,
    },
  });
}

export async function updateCourseStatus(
  courseId: string,
  data: UpdateCourseStatusInput,
) {
  const course = await prisma.curso.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      isPremium: true,
      preco: true,
      modulos: {
        select: {
          aulas: {
            select: {
              id: true,
              conteudo: true,
              videoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  if (data.status === 'PUBLICADO') {
    const lessons = course.modulos.flatMap((module) => module.aulas);

    if (course.modulos.length === 0 || lessons.length === 0) {
      throw new AppError('Adicione ao menos um módulo e uma aula antes de publicar.', 400);
    }

    if (!lessons.some((lesson) => lesson.conteudo || lesson.videoUrl)) {
      throw new AppError('Adicione conteúdo ou vídeo em ao menos uma aula antes de publicar.', 400);
    }

    if (course.isPremium && (!course.preco || course.preco <= 0)) {
      throw new AppError('Defina um preço válido antes de publicar um curso premium.', 400);
    }
  }

  return prisma.curso.update({
    where: {
      id: courseId,
    },
    data: {
      status: data.status,
      publico: data.status === 'PUBLICADO',
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      publico: true,
      isPremium: true,
      preco: true,
      nivel: true,
      categoria: true,
      updatedAt: true,
    },
  });
}

export async function updateCourseCommercial(
  courseId: string,
  data: UpdateCourseCommercialInput,
) {
  const course = await prisma.curso.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  if (data.isPremium && (!data.preco || data.preco <= 0)) {
    throw new AppError('Curso premium precisa de um preço maior que zero.', 400);
  }

  return prisma.curso.update({
    where: {
      id: courseId,
    },
    data: {
      isPremium: data.isPremium,
      preco: data.isPremium ? data.preco : null,
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      publico: true,
      isPremium: true,
      preco: true,
      nivel: true,
      categoria: true,
      updatedAt: true,
    },
  });
}

export async function updateCourseSales(
  courseId: string,
  data: UpdateCourseSalesInput,
) {
  const course = await prisma.curso.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  return prisma.curso.update({
    where: { id: courseId },
    data,
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      publico: true,
      isPremium: true,
      preco: true,
      resumo: true,
      imagem: true,
      beneficios: true,
      publicoAlvo: true,
      nivel: true,
      categoria: true,
      updatedAt: true,
    },
  });
}

export async function updateLessonPreview(
  lessonId: string,
  data: UpdateLessonPreviewInput,
) {
  const lesson = await prisma.aula.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });

  if (!lesson) {
    throw new AppError('Aula não encontrada.', 404);
  }

  return prisma.aula.update({
    where: { id: lessonId },
    data: { isGratuita: data.isGratuita },
    select: {
      id: true,
      titulo: true,
      isGratuita: true,
    },
  });
}

export async function listAdminTransactions() {
  return prisma.transacao.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
    select: {
      id: true,
      mpPaymentId: true,
      valorTotal: true,
      status: true,
      metodoPagamento: true,
      referenciaCompra: true,
      linkPagamento: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });
}

export async function updateUserAccess(
  userId: string,
  data: UpdateUserAccessInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: data.role,
      status: data.status,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      status: true,
    },
  });
}

export async function getTrackingSettings() {
  const settings = await prisma.configuracaoPlataforma.findUnique({
    where: {
      id: PLATFORM_SETTINGS_ID,
    },
    select: {
      googleTagManagerId: true,
      googleAnalyticsMeasurementId: true,
      metaPixelId: true,
      updatedAt: true,
    },
  });

  return (
    settings ?? {
      googleTagManagerId: null,
      googleAnalyticsMeasurementId: null,
      metaPixelId: null,
      updatedAt: null,
    }
  );
}

export async function updateTrackingSettings(
  data: UpdateTrackingSettingsInput,
) {
  return prisma.configuracaoPlataforma.upsert({
    where: {
      id: PLATFORM_SETTINGS_ID,
    },
    create: {
      id: PLATFORM_SETTINGS_ID,
      ...data,
    },
    update: data,
    select: {
      googleTagManagerId: true,
      googleAnalyticsMeasurementId: true,
      metaPixelId: true,
      updatedAt: true,
    },
  });
}
