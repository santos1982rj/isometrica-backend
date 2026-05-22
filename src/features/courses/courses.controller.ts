import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';
import {
  enrollFreeCourse,
  getPublicCourseBySlug,
  listPublicCourses,
} from './courses.service';

export async function listCoursesController(
  request: Request,
  response: Response,
) {
  const courses = await listPublicCourses(request.user?.id);

  return response.status(200).json({
    courses,
  });
}

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

  const course = await getPublicCourseBySlug(slug, request.user);

  return response.status(200).json({
    course,
  });
}

export async function enrollFreeCourseController(
  request: Request,
  response: Response,
) {
  const userId = request.user?.id;
  const courseId = request.params.courseId;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!courseId || Array.isArray(courseId)) {
    throw new AppError('Curso inválido.', 400);
  }

  const enrollment = await enrollFreeCourse(courseId, userId);

  return response.status(201).json({
    enrollment,
  });
}
