import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from '../../config/env';
import { AppError } from '../errors/AppError';

type JwtPayload = {
  sub: string;
  role: Role;
};

/**
 * Middleware responsável por validar o token JWT do usuário autenticado.
 *
 * @param request Requisição HTTP com header Authorization.
 * @param response Resposta HTTP.
 * @param next Próximo middleware da cadeia.
 * @throws AppError quando o token não existe ou é inválido.
 */
export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não informado.', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token inválido.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    return next();
  } catch {
    throw new AppError('Token inválido ou expirado.', 401);
  }
}