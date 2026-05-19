import { Request, Response } from 'express';

import {
  completeLesson,
  getStudentProgress,
} from './progress.service';
import { AppError } from '../../core/errors/AppError';

/**
 * Controller responsável por marcar uma aula como concluída.
 *
 * @param request Requisição HTTP com usuário autenticado e lessonId.
 * @param response Resposta HTTP com progresso atualizado.
 * @throws AppError quando o usuário não está autenticado.
 */
export async function completeLessonController(
  request: Request,
  response: Response,
) {
  const userId = request.user?.id;
  const lessonId = request.params.lessonId;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  const progress = await completeLesson(userId, lessonId);

  return response.status(201).json({
    progress,
  });
}

/**
 * Controller responsável por listar o progresso do usuário autenticado.
 *
 * @param request Requisição HTTP com usuário autenticado.
 * @param response Resposta HTTP com progresso do usuário.
 * @throws AppError quando o usuário não está autenticado.
 */
export async function getMyProgressController(
  request: Request,
  response: Response,
) {
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const progress = await getStudentProgress(userId);

  return response.status(200).json({
    progress,
  });
}