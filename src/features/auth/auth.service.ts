import { createHash, randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.schema';

type AuthResponse = {
  user: {
    id: string;
    nome: string;
    email: string;
    avatar: string | null;
    role: string;
    xpTotal: number;
    nivel: number;
  };
  token: string;
};

const RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000;
const EMAIL_VERIFICATION_EXPIRATION_MS = 24 * 60 * 60 * 1000;

function signUserToken(user: { id: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

function toAuthResponse(user: {
  id: string;
  nome: string;
  email: string;
  avatar: string | null;
  role: string;
  xpTotal: number;
  nivel: number;
}): AuthResponse {
  return {
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      xpTotal: user.xpTotal,
      nivel: user.nivel,
    },
    token: signUserToken(user),
  };
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (userAlreadyExists) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const user = await prisma.user.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: await bcrypt.hash(data.senha, 10),
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      marketingConsent: data.marketingConsent,
      trackingConsent: data.trackingConsent,
    },
  });

  return toAuthResponse(user);
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const passwordMatches = await bcrypt.compare(data.senha, user.senha);

  if (!passwordMatches) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  return toAuthResponse(user);
}

export async function requestPasswordReset(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
    },
  });

  let resetUrl: string | undefined;

  if (user) {
    const token = randomBytes(32).toString('hex');

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS),
        },
      }),
    ]);

    resetUrl = `${env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
  }

  return {
    message:
      'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.',
    ...(env.PASSWORD_RESET_LINK_MODE === 'development' && resetUrl
      ? { resetUrl }
      : {}),
  };
}

export async function resetPassword(data: ResetPasswordInput) {
  const passwordReset = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashResetToken(data.token),
    },
    select: {
      id: true,
      expiresAt: true,
      usedAt: true,
      userId: true,
    },
  });

  if (
    !passwordReset ||
    passwordReset.usedAt ||
    passwordReset.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError('Link de redefinição inválido ou expirado.', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: passwordReset.userId,
      },
      data: {
        senha: await bcrypt.hash(data.senha, 10),
      },
    }),
    prisma.passwordResetToken.update({
      where: {
        id: passwordReset.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);
}

export async function createEmailVerificationLink(userId: string) {
  const token = randomBytes(32).toString('hex');

  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_MS),
      },
    }),
  ]);

  return `${env.FRONTEND_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;
}

export async function verifyEmail(data: VerifyEmailInput) {
  const emailVerification = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash: hashResetToken(data.token),
    },
    select: {
      id: true,
      userId: true,
      usedAt: true,
      expiresAt: true,
    },
  });

  if (
    !emailVerification ||
    emailVerification.usedAt ||
    emailVerification.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError('Link de validação inválido ou expirado.', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: emailVerification.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.update({
      where: {
        id: emailVerification.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);
}
