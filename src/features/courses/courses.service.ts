import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

export async function listPublicCourses() {
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
    },
  });

  return courses.map((course) => {
    const { modulos, ...rest } = course;

    return {
      ...rest,
      totalModulos: modulos.length,
    };
  });
}

export async function getPublicCourseBySlug(slug: string) {
  const course = await prisma.curso.findFirst({
    where: {
      slug,
      publico: true,
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      descricao: true,
      resumo: true,
      imagem: true,
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
    },
  });

  if (!course) {
    throw new AppError('Curso não encontrado.', 404);
  }

  return course;
}