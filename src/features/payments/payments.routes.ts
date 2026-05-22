import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { validateRequest } from '../../core/middlewares/validateRequest';
import {
  createPaymentPreferenceController,
  mercadoPagoWebhookController,
  processTransparentPaymentController,
} from './payments.controller';
import {
  createPaymentPreferenceSchema,
  processTransparentPaymentSchema,
} from './payments.schema';

export const paymentsRoutes = Router();

paymentsRoutes.post(
  '/preferences',
  authMiddleware,
  validateRequest(createPaymentPreferenceSchema),
  createPaymentPreferenceController,
);

paymentsRoutes.post(
  '/process',
  authMiddleware,
  validateRequest(processTransparentPaymentSchema),
  processTransparentPaymentController,
);

paymentsRoutes.post(
  '/webhook/mercadopago',
  mercadoPagoWebhookController,
);
