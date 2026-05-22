import { createHmac, timingSafeEqual } from 'node:crypto';

import { Request, Response } from 'express';

import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';
import {
  createCoursePaymentPreference,
  processTransparentPayment,
  processMercadoPagoWebhook,
} from './payments.service';

function readWebhookSignature(signatureHeader?: string) {
  return signatureHeader?.split(',').reduce<Record<string, string>>((parts, item) => {
    const [key, value] = item.trim().split('=');

    if (key && value) {
      parts[key] = value;
    }

    return parts;
  }, {});
}

export function validateMercadoPagoWebhookSignature(
  request: Request,
  paymentId: string | number | undefined,
  secret: string,
) {
  const signature = readWebhookSignature(request.header('x-signature'));
  const requestId = request.header('x-request-id');
  const timestamp = signature?.ts;
  const hash = signature?.v1;

  if (!paymentId || !requestId || !timestamp || !hash) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');
  const expectedBuffer = Buffer.from(expectedHash);
  const hashBuffer = Buffer.from(hash);

  return expectedBuffer.length === hashBuffer.length &&
    timingSafeEqual(expectedBuffer, hashBuffer);
}

export async function createPaymentPreferenceController(
  request: Request,
  response: Response,
) {
  const actor = request.user;
  const courseId = request.body?.courseId as string | undefined;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!courseId || typeof courseId !== 'string') {
    throw new AppError('courseId inválido.', 400);
  }

  const preference = await createCoursePaymentPreference(actor, courseId);

  return response.status(201).json({
    preference,
  });
}

export async function mercadoPagoWebhookController(
  request: Request,
  response: Response,
) {
  const bodyType = request.body?.type as string | undefined;
  const bodyDataId = request.body?.data?.id as string | number | undefined;
  const queryType = request.query.type as string | undefined;
  const queryDataId = request.query['data.id'] as string | undefined;

  const eventType = bodyType ?? queryType;
  const paymentId = bodyDataId ?? queryDataId;
  const configuredSecret = env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (
    configuredSecret &&
    !validateMercadoPagoWebhookSignature(request, paymentId, configuredSecret)
  ) {
    throw new AppError('Webhook nao autorizado.', 401);
  }

  if (eventType !== 'payment' || !paymentId) {
    return response.status(200).json({
      ok: true,
      ignored: true,
      reason: 'evento não é de pagamento',
    });
  }

  await processMercadoPagoWebhook(paymentId);

  return response.status(200).json({
    ok: true,
  });
}

export async function processTransparentPaymentController(
  request: Request,
  response: Response,
) {
  const actor = request.user;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const result = await processTransparentPayment(actor, request.body);

  return response.status(201).json({
    payment: result,
  });
}
