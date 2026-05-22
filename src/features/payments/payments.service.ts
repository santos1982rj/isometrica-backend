import { randomUUID } from 'node:crypto';

import { StatusTransacao, TipoAcesso } from '@prisma/client';

import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';
import type { AuthUser } from '../auth/auth.types';
import type { ProcessTransparentPaymentInput } from './payments.schema';

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: string | number;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  payment_method_id?: string;
  external_reference?: string;
  date_approved?: string;
  installments?: number;
  transaction_details?: {
    external_resource_url?: string | null;
  };
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string | null;
      qr_code_base64?: string | null;
      ticket_url?: string | null;
    };
  };
};

function getAccessToken() {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new AppError('Mercado Pago não configurado no servidor.', 500);
  }

  return env.MERCADO_PAGO_ACCESS_TOKEN;
}

export function mapPaymentStatus(status?: string): StatusTransacao {
  if (status === 'approved') {
    return 'APROVADO';
  }

  if (status === 'refunded' || status === 'cancelled' || status === 'charged_back') {
    return 'ESTORNADO';
  }

  if (status === 'rejected') {
    return 'RECUSADO';
  }

  return 'PENDENTE';
}

function parseExternalReference(reference?: string | null) {
  if (!reference) {
    return null;
  }

  const [userId, courseId] = reference.split(':');

  if (!userId || !courseId) {
    return null;
  }

  return { userId, courseId };
}

function canUseCheckoutReturnUrl(frontendUrl: string) {
  try {
    const hostname = new URL(frontendUrl).hostname;

    return hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1';
  } catch {
    return false;
  }
}

async function assertCourseCanBePurchased(userId: string, courseId: string) {
  const existingEnrollment = await prisma.matricula.findUnique({
    where: {
      userId_cursoId: {
        userId,
        cursoId: courseId,
      },
    },
    select: { id: true },
  });

  if (existingEnrollment) {
    throw new AppError('Voce ja esta matriculado neste curso.', 400);
  }
}

async function persistPaymentAndAccess(
  payment: MercadoPagoPaymentResponse,
  idempotencyKey?: string,
) {
  const parsedReference = parseExternalReference(payment.external_reference);

  if (!parsedReference) {
    return {
      ignored: true,
      reason: 'external_reference ausente ou inválido',
    };
  }

  const { userId, courseId } = parsedReference;
  const mappedStatus = mapPaymentStatus(payment.status);
  const value = payment.transaction_amount ?? 0;
  const method = payment.payment_method_id ?? 'mercadopago';

  const transaction = await prisma.transacao.upsert({
    where: {
      mpPaymentId: String(payment.id),
    },
    update: {
      status: mappedStatus,
      valorTotal: value,
      metodoPagamento: method,
      referenciaCompra: courseId,
      cursoId: courseId,
      linkPagamento: null,
      userId,
      statusDetail: payment.status_detail ?? null,
      installments: payment.installments ?? null,
      approvedAt: payment.date_approved ? new Date(payment.date_approved) : null,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    },
    create: {
      mpPaymentId: String(payment.id),
      status: mappedStatus,
      valorTotal: value,
      metodoPagamento: method,
      referenciaCompra: courseId,
      cursoId: courseId,
      linkPagamento: null,
      userId,
      idempotencyKey: idempotencyKey ?? null,
      statusDetail: payment.status_detail ?? null,
      installments: payment.installments ?? null,
      approvedAt: payment.date_approved ? new Date(payment.date_approved) : null,
    },
  });

  if (mappedStatus === 'APROVADO') {
    await prisma.matricula.upsert({
      where: {
        userId_cursoId: {
          userId,
          cursoId: courseId,
        },
      },
      update: {
        tipoAcesso: TipoAcesso.COMPRA_AVULSA,
      },
      create: {
        userId,
        cursoId: courseId,
        tipoAcesso: TipoAcesso.COMPRA_AVULSA,
      },
    });
  }

  if (mappedStatus === 'ESTORNADO') {
    await prisma.matricula.deleteMany({
      where: {
        userId,
        cursoId: courseId,
        tipoAcesso: TipoAcesso.COMPRA_AVULSA,
      },
    });
  }

  return {
    ignored: false,
    transactionId: transaction.id,
    status: transaction.status,
  };
}

export async function createCoursePaymentPreference(
  actor: AuthUser,
  courseId: string,
) {
  const course = await prisma.curso.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      slug: true,
      isPremium: true,
      preco: true,
      publico: true,
    },
  });

  if (!course || !course.publico) {
    throw new AppError('Curso não encontrado.', 404);
  }

  if (!course.isPremium || !course.preco || course.preco <= 0) {
    throw new AppError('Este curso não exige pagamento.', 400);
  }

  const existingEnrollment = await prisma.matricula.findUnique({
    where: {
      userId_cursoId: {
        userId: actor.id,
        cursoId: courseId,
      },
    },
    select: { id: true },
  });

  if (existingEnrollment) {
    throw new AppError('Você já está matriculado neste curso.', 400);
  }

  const accessToken = getAccessToken();
  const apiBaseUrl = env.API_BASE_URL ?? `http://localhost:${env.PORT}`;
  const frontendUrl = env.FRONTEND_URL ?? 'http://localhost:5173';
  const externalReference = `${actor.id}:${course.id}`;

  const payload = {
    items: [
      {
        id: course.id,
        title: course.titulo,
        description: course.descricao ?? 'Curso premium ISOMETRICA',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(course.preco.toFixed(2)),
      },
    ],
    external_reference: externalReference,
    purpose: 'wallet_purchase',
    notification_url: `${apiBaseUrl}/payments/webhook/mercadopago`,
    ...(canUseCheckoutReturnUrl(frontendUrl)
      ? {
          back_urls: {
            success: `${frontendUrl}/courses/${course.slug}`,
            failure: `${frontendUrl}/courses/${course.slug}`,
            pending: `${frontendUrl}/courses/${course.slug}`,
          },
          auto_return: 'approved',
        }
      : {}),
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Falha ao criar checkout no Mercado Pago: ${errorText}`, 502);
  }

  const data = (await response.json()) as MercadoPagoPreferenceResponse;
  const checkoutUrl = data.init_point ?? data.sandbox_init_point;

  if (!checkoutUrl) {
    throw new AppError('Mercado Pago não retornou link de pagamento.', 502);
  }

  return {
    preferenceId: data.id,
    checkoutUrl,
  };
}

function getPaymentInstructions(payment: MercadoPagoPaymentResponse) {
  const pixData = payment.point_of_interaction?.transaction_data;

  return {
    pixQrCode: pixData?.qr_code ?? null,
    pixQrCodeBase64: pixData?.qr_code_base64 ?? null,
    ticketUrl:
      pixData?.ticket_url ??
      payment.transaction_details?.external_resource_url ??
      null,
  };
}

export async function processTransparentPayment(
  actor: AuthUser,
  input: ProcessTransparentPaymentInput,
) {
  const course = await prisma.curso.findUnique({
    where: { id: input.courseId },
    select: { id: true, isPremium: true, preco: true, publico: true },
  });

  if (!course || !course.publico) {
    throw new AppError('Curso não encontrado.', 404);
  }

  if (!course.isPremium || !course.preco || course.preco <= 0) {
    throw new AppError('Este curso não exige pagamento.', 400);
  }

  const previousAttempt = await prisma.transacao.findUnique({
    where: {
      idempotencyKey: input.paymentAttemptId,
    },
    select: {
      mpPaymentId: true,
      status: true,
      statusDetail: true,
      valorTotal: true,
    },
  });

  if (previousAttempt) {
    return {
      paymentId: previousAttempt.mpPaymentId,
      paymentStatus: previousAttempt.status.toLowerCase(),
      statusDetail: previousAttempt.statusDetail,
      transactionAmount: previousAttempt.valorTotal,
      instructions: {
        pixQrCode: null,
        pixQrCodeBase64: null,
        ticketUrl: null,
      },
      persisted: {
        ignored: false,
        status: previousAttempt.status,
      },
    };
  }

  await assertCourseCanBePurchased(actor.id, input.courseId);

  const accessToken = getAccessToken();
  const apiBaseUrl = env.API_BASE_URL ?? `http://localhost:${env.PORT}`;
  const externalReference = `${actor.id}:${course.id}`;

  const paymentPayload = {
    transaction_amount: Number(course.preco.toFixed(2)),
    payment_method_id: input.payment_method_id,
    ...(input.token ? { token: input.token } : {}),
    ...(input.installments ? { installments: input.installments } : {}),
    issuer_id: input.issuer_id || undefined,
    payer: {
      email: input.payer.email,
      identification: input.payer.identification,
      first_name: input.payer.first_name,
      last_name: input.payer.last_name,
      address: input.payer.address,
    },
    ...(input.metadata ? { metadata: input.metadata } : {}),
    ...(input.transaction_details
      ? { transaction_details: input.transaction_details }
      : {}),
    ...(input.additional_info ? { additional_info: input.additional_info } : {}),
    external_reference: externalReference,
    description: `Compra curso premium ${course.id}`,
    notification_url: `${apiBaseUrl}/payments/webhook/mercadopago`,
  };

  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.paymentAttemptId,
    },
    body: JSON.stringify(paymentPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Falha ao processar pagamento transparente: ${errorText}`, 502);
  }

  const payment = (await response.json()) as MercadoPagoPaymentResponse;
  const persisted = await persistPaymentAndAccess(payment, input.paymentAttemptId);

  return {
    paymentId: String(payment.id),
    paymentStatus: payment.status ?? 'unknown',
    statusDetail: payment.status_detail ?? null,
    transactionAmount: payment.transaction_amount ?? 0,
    instructions: getPaymentInstructions(payment),
    persisted,
  };
}

export async function processMercadoPagoWebhook(paymentIdRaw: string | number) {
  const paymentId = String(paymentIdRaw);
  const accessToken = getAccessToken();

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Falha ao consultar pagamento ${paymentId}: ${errorText}`, 502);
  }

  const payment = (await response.json()) as MercadoPagoPaymentResponse;
  return persistPaymentAndAccess(payment);
}

export async function refreshUserPayment(
  userId: string,
  transactionId: string,
) {
  const transaction = await prisma.transacao.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    select: {
      mpPaymentId: true,
    },
  });

  if (!transaction) {
    throw new AppError('Pagamento não encontrado.', 404);
  }

  await processMercadoPagoWebhook(transaction.mpPaymentId);

  const updatedTransaction = await prisma.transacao.findUnique({
    where: {
      mpPaymentId: transaction.mpPaymentId,
    },
    select: {
      id: true,
      mpPaymentId: true,
      valorTotal: true,
      status: true,
      metodoPagamento: true,
      referenciaCompra: true,
      linkPagamento: true,
      statusDetail: true,
      installments: true,
      approvedAt: true,
      createdAt: true,
      updatedAt: true,
      curso: {
        select: {
          id: true,
          titulo: true,
          slug: true,
        },
      },
    },
  });

  if (!updatedTransaction) {
    throw new AppError('Pagamento não encontrado após atualização.', 404);
  }

  return updatedTransaction;
}
