import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';

import {
  getMyAnalyticsController,
  getWeeklyAnalyticsController,
} from './analytics.controller';

const analyticsRoutes = Router();

/**
 * Retorna o resumo acadêmico consolidado do aluno autenticado.
 *
 * Endpoint:
 * GET /analytics/me
 */
analyticsRoutes.get('/me', authMiddleware, getMyAnalyticsController);

/**
 * Retorna os dados semanais de progresso do aluno autenticado.
 *
 * Endpoint:
 * GET /analytics/me/weekly
 */
analyticsRoutes.get(
  '/me/weekly',
  authMiddleware,
  getWeeklyAnalyticsController,
);

export { analyticsRoutes };