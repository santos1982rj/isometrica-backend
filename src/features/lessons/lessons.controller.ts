import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';
import { getLessonById } from './lessons.service';

export async function getLessonController(
  request: Request,
  response: Response,
) {
  const lessonId = request.params.id;

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  const lesson = await getLessonById(lessonId, request.user);

  return response.status(200).json({
    lesson,
  });
}
