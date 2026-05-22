import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';
import type { AuthUser } from '../auth/auth.types';

export async function listPublicCourses(userId?: string) {
  const courses = await prisma.curso.findMany({
    where: {
      publico: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      resumo: true,
      imagem: true,
      beneficios: true,
      publicoAlvo: true,
      isPremium: true,
      preco: true,
      cargaHoraria: true,
      nivel: true,
      categoria: true,
      createdAt: true,
      modulos: {
        select: {
          id: true,
        },
      },
      matriculas: userId
        ? {
            where: {
              userId,
            },
            select: {
              id: true,
              tipoAcesso: true,
              progresso: true,
              concluido: true,
            },
          }
        : false,
    },
  });

  return courses.map((course) => {
    const { modulos, matriculas = [], ...rest } = course;
    const enrollment = matriculas[0] ?? null;

    return {
      ...rest,
      totalModulos: modulos.length,
      isEnrolled: !!enrollment,
      enrollment,
    };
  });
}

export async function getPublicCourseBySlug(slug: string, actor?: AuthUser) {
  const course = await prisma.curso.findFirst({
    where: {
      slug,
      ...(actor?.role === 'ADMIN'
        ? {}
        : actor?.role === 'PROFESSOR'
          ? {
              OR: [
                { publico: true },
                { criadoPorId: actor.id },
              ],
            }
          : { publico: true }),
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      resumo: true,
      imagem: true,
      beneficios: true,
      publicoAlvo: true,
      isPremium: true,
      preco: true,
      cargaHoraria: true,
      nivel: true,
      categoria: true,
      createdAt: true,
      modulos: {
        orderBy: {
          ordem: 'asc',
        },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          ordem: true,
          aulas: {
            orderBy: {
              ordem: 'asc',
            },
            select: {
              id: true,
              titulo: true,
              slug: true,
              descricao: true,
              duracao: true,
              ordem: true,
              isGratuita: true,
            },
          },
        },
      },
      matriculas: actor?.id
        ? {
            where: {
              userId: actor.id,
            },
            select: {
              id: true,
              tipoAcesso: true,
              progresso: true,
              concluido: true,
            },
          }
        : false,
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  const { matriculas = [], ...rest } = course;
  const enrollment = matriculas[0] ?? null;

  return {
    ...rest,
    isEnrolled: !!enrollment,
    enrollment,
  };
}

export async function enrollFreeCourse(courseId: string, userId: string) {
  const course = await prisma.curso.findFirst({
    where: {
      id: courseId,
      publico: true,
    },
    select: {
      id: true,
      isPremium: true,
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  if (course.isPremium) {
    throw new AppError(
      'Este curso é premium. Use o fluxo de compra para se matricular.',
      403,
    );
  }

  return prisma.matricula.upsert({
    where: {
      userId_cursoId: {
        userId,
        cursoId: courseId,
      },
    },
    update: {
      tipoAcesso: 'GRATUITO',
    },
    create: {
      userId,
      cursoId: courseId,
      tipoAcesso: 'GRATUITO',
    },
  });
}
