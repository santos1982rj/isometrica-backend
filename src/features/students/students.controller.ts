import { Response, Request } from 'express';

import { AppError } from '../../core/errors/AppError';
import {
  changeStudentPassword,
  getStudentProfile,
  listStudentCourses,
  listStudentPurchases,
  updateStudentProfile,
  updateStudentPreferences,
  requestStudentEmailVerification,
} from './students.service';
import { refreshUserPayment } from '../payments/payments.service';

function getAuthenticatedUserId(request: Request) {
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  return userId;
}

export async function getMeController(request: Request, response: Response) {
  const user = await getStudentProfile(getAuthenticatedUserId(request));

  return response.status(200).json({
    user,
  });
}

export async function listMyCoursesController(
  request: Request,
  response: Response,
) {
  const enrollments = await listStudentCourses(
    getAuthenticatedUserId(request),
  );

  return response.status(200).json({
    enrollments,
  });
}

export async function updateMeController(
  request: Request,
  response: Response,
) {
  const user = await updateStudentProfile(
    getAuthenticatedUserId(request),
    request.body,
  );

  return response.status(200).json({
    user,
  });
}

export async function uploadAvatarController(
  request: Request,
  response: Response,
) {
  if (!request.file) {
    throw new AppError('Imagem do avatar não enviada.', 400);
  }

  const user = await updateStudentProfile(
    getAuthenticatedUserId(request),
    {
      avatar: `/uploads/${request.file.filename}`,
    },
  );

  return response.status(200).json({
    user,
  });
}

export async function listMyPurchasesController(
  request: Request,
  response: Response,
) {
  const purchases = await listStudentPurchases(
    getAuthenticatedUserId(request),
  );

  return response.status(200).json({
    purchases,
  });
}

export async function refreshMyPurchaseController(
  request: Request,
  response: Response,
) {
  const purchaseId = request.params.purchaseId;

  if (!purchaseId || Array.isArray(purchaseId)) {
    throw new AppError('Pagamento inválido.', 400);
  }

  const purchase = await refreshUserPayment(
    getAuthenticatedUserId(request),
    purchaseId,
  );

  return response.status(200).json({
    purchase,
  });
}

export async function changePasswordController(
  request: Request,
  response: Response,
) {
  await changeStudentPassword(
    getAuthenticatedUserId(request),
    request.body,
  );

  return response.status(200).json({
    message: 'Senha atualizada com sucesso.',
  });
}

export async function updatePreferencesController(
  request: Request,
  response: Response,
) {
  const preferences = await updateStudentPreferences(
    getAuthenticatedUserId(request),
    request.body,
  );

  return response.status(200).json({
    preferences,
  });
}

export async function requestEmailVerificationController(
  request: Request,
  response: Response,
) {
  const result = await requestStudentEmailVerification(
    getAuthenticatedUserId(request),
  );

  return response.status(200).json(result);
}
