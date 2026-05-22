import { Request, Response } from 'express';

import {
  completeLesson,
  getStudentProgress,
  updateLessonNotes,
  updateLessonWatchTime,
} from './progress.service';
import { AppError } from '../../core/errors/AppError';

export async function completeLessonController(
  request: Request,
  response: Response,
) {
  const actor = request.user;
  const lessonId = request.params.lessonId;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  const progress = await completeLesson(actor, lessonId);

  return response.status(201).json({
    progress,
  });
}

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

export async function updateLessonWatchTimeController(
  request: Request,
  response: Response,
) {
  const actor = request.user;
  const lessonId = request.params.lessonId;
  const { tempoAssistido } = request.body as {
    tempoAssistido?: unknown;
  };

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  if (typeof tempoAssistido !== 'number') {
    throw new AppError('Tempo assistido inválido.', 400);
  }

  const progress = await updateLessonWatchTime(
    actor,
    lessonId,
    tempoAssistido,
  );

  return response.status(200).json({
    progress,
  });
}

export async function updateLessonNotesController(
  request: Request,
  response: Response,
) {
  const actor = request.user;
  const lessonId = request.params.lessonId;
  const { notas } = request.body as {
    notas?: unknown;
  };

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  if (typeof notas !== 'string') {
    throw new AppError('Notas inválidas.', 400);
  }

  const progress = await updateLessonNotes(actor, lessonId, notas);

  return response.status(200).json({
    progress,
  });
}
