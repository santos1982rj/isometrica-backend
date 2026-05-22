import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from '../../config/env';

type JwtPayload = {
  sub: string;
  role: Role;
};

export function optionalAuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;
  const [, token] = authHeader?.split(' ') ?? [];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };
  } catch {}

  return next();
}
