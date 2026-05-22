import { Request, Response } from 'express';

import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from './auth.service';

export async function registerController(request: Request, response: Response) {
  const result = await registerUser(request.body);

  return response.status(201).json(result);
}

export async function loginController(request: Request, response: Response) {
  const result = await loginUser(request.body);

  return response.status(200).json(result);
}

export async function forgotPasswordController(
  request: Request,
  response: Response,
) {
  const result = await requestPasswordReset(request.body);

  return response.status(200).json(result);
}

export async function resetPasswordController(
  request: Request,
  response: Response,
) {
  await resetPassword(request.body);

  return response.status(200).json({
    message: 'Senha redefinida com sucesso.',
  });
}

export async function verifyEmailController(
  request: Request,
  response: Response,
) {
  await verifyEmail(request.body);

  return response.status(200).json({
    message: 'E-mail validado com sucesso.',
  });
}
