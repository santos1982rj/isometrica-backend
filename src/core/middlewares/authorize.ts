import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';

import { AppError } from '../errors/AppError';

/**
 * Middleware de autorização baseado em papéis de usuário.
 *
 * @param allowedRoles Lista de papéis autorizados para acessar a rota.
 * @returns Middleware Express.
 * @throws AppError quando o usuário não possui permissão.
 */
export function authorize(allowedRoles: Role[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new AppError('Usuário não autenticado.', 401);
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError('Acesso não autorizado.', 403);
    }

    return next();
  };
}