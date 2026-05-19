import { Request, Response } from 'express';

import { getLessonById } from './lessons.service';

export async function getLessonController(
  request: Request,
  response: Response,
) {
  const lessonId = request.params.id;

  if (!lessonId || Array.isArray(lessonId)) {
    return response.status(400).json({
      status: 'error',
      message: 'ID da aula inválido.',
    });
  }

  const lesson = await getLessonById(lessonId);

  return response.status(200).json({
    lesson,
  });
}