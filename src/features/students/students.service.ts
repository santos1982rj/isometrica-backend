import bcrypt from 'bcryptjs';

import { prisma } from '../../config/prisma';
import { AppError } from '../../core/errors/AppError';
import type {
  ChangePasswordInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from './students.schema';
import { createEmailVerificationLink } from '../auth/auth.service';
import { env } from '../../config/env';

export async function getStudentProfile(userId: string) {
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
      emailVerifiedAt: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      marketingConsent: true,
      trackingConsent: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return user;
}

export async function listStudentCourses(userId: string) {
  return prisma.matricula.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      tipoAcesso: true,
      progresso: true,
      concluido: true,
      createdAt: true,
      curso: {
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          resumo: true,
          imagem: true,
          isPremium: true,
          preco: true,
          cargaHoraria: true,
          nivel: true,
          categoria: true,
          modulos: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
}

export async function listStudentPurchases(userId: string) {
  return prisma.transacao.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
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
}

export async function updateStudentProfile(
  userId: string,
  data: UpdateProfileInput,
) {
  const nome = data.nome?.trim();

  if (nome !== undefined && nome.length < 2) {
    throw new AppError('Nome deve ter pelo menos 2 caracteres.', 400);
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...(nome ? { nome } : {}),
      ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      avatar: true,
      role: true,
      xpTotal: true,
      nivel: true,
      streak: true,
    },
  });
}

export async function changeStudentPassword(
  userId: string,
  data: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      senha: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (!(await bcrypt.compare(data.currentPassword, user.senha))) {
    throw new AppError('Senha atual incorreta.', 400);
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      senha: await bcrypt.hash(data.newPassword, 10),
    },
  });
}

export async function updateStudentPreferences(
  userId: string,
  data: UpdatePreferencesInput,
) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: {
      marketingConsent: true,
      trackingConsent: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
    },
  });
}

export async function requestStudentEmailVerification(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (user.emailVerifiedAt) {
    return {
      message: 'Seu e-mail já foi validado.',
    };
  }

  const verificationUrl = await createEmailVerificationLink(user.id);

  return {
    message:
      'Link de validação preparado. O envio por e-mail será conectado ao provedor de e-mail.',
    ...(env.PASSWORD_RESET_LINK_MODE === 'development'
      ? { verificationUrl }
      : {}),
  };
}
