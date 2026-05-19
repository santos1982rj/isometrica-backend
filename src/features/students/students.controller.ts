import { Response, Request } from 'express';

import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';

/**
 * Retorna o perfil do estudante autenticado.
 *
 * @param request Requisição HTTP contendo o usuário autenticado.
 * @param response Resposta HTTP com os dados do estudante.
 * @throws AppError quando o usuário não é encontrado.
 */
export async function getMeController(request: Request, response: Response) {
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      avatar: true,
      role: true,
      status: true,
      xpTotal: true,
      nivel: true,
      streak: true,
      hasActiveSub: true,
      subExpiresAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return response.status(200).json({
    user,
  });
}