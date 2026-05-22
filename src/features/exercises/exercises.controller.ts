import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';

import {
  attemptExercise,
  getLessonExercises,
} from './exercises.service';

import { attemptExerciseSchema } from './exercises.schema';

export async function getLessonExercisesController(
  request: Request,
  response: Response,
) {
  const lessonId = request.params.lessonId;
  const actor = request.user;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  const exercises = await getLessonExercises(lessonId, actor);

  return response.status(200).json({
    exercises,
  });
}

export async function attemptExerciseController(
  request: Request,
  response: Response,
) {
  const actor = request.user;
  const exerciseId = request.params.exerciseId;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!exerciseId || Array.isArray(exerciseId)) {
    throw new AppError('ID do exercício inválido.', 400);
  }

  const data = attemptExerciseSchema.parse(request.body);

  const attempt = await attemptExercise(
    actor,
    exerciseId,
    data.resposta,
    data.correta,
  );

  return response.status(201).json({
    attempt,
  });
}
