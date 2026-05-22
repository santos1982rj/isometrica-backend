import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';

import {
  getStudentAnalytics,
  getWeeklyAnalytics,
} from './analytics.service';

/**
 * Controller responsável por retornar o resumo acadêmico do aluno.
 *
 * @param request Requisição HTTP autenticada.
 * @param response Resposta HTTP.
 * @returns Analytics acadêmico consolidado do aluno.
 * @throws AppError quando o usuário não está autenticado.
 */
export async function getMyAnalyticsController(
  request: Request,
  response: Response,
) {
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const analytics = await getStudentAnalytics(userId);

  return response.status(200).json({
    analytics,
  });
}

/**
 * Controller responsável por retornar o progresso semanal do aluno.
 *
 * @param request Requisição HTTP autenticada.
 * @param response Resposta HTTP.
 * @returns Dados semanais de progresso do aluno.
 * @throws AppError quando o usuário não está autenticado.
 */
export async function getWeeklyAnalyticsController(
  request: Request,
  response: Response,
) {
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const weekly = await getWeeklyAnalytics(userId);

  return response.status(200).json({
    weekly,
  });
}