import { Request, Response } from 'express';

import {
  getPublicCourseBySlug,
  listPublicCourses,
} from './courses.service';

/**
 * Controller responsável por listar cursos públicos.
 *
 * @param request Requisição HTTP.
 * @param response Resposta HTTP com lista de cursos.
 */
export async function listCoursesController(
  request: Request,
  response: Response,
) {
  const courses = await listPublicCourses();

  return response.status(200).json({
    courses,
  });
}

/**
 * Controller responsável por buscar curso pelo slug.
 *
 * @param request Requisição HTTP contendo slug do curso.
 * @param response Resposta HTTP com dados completos do curso.
 */
export async function getCourseBySlugController(
  request: Request,
  response: Response,
) {
  const slug = request.params.slug;

  if (!slug || Array.isArray(slug)) {
    return response.status(400).json({
      status: 'error',
      message: 'Slug do curso inválido.',
    });
  }

  const course = await getPublicCourseBySlug(slug);

  return response.status(200).json({
    course,
  });
}