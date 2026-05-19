import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';
import { LoginInput, RegisterInput } from './auth.schema';

type AuthResponse = {
  user: {
    id: string;
    nome: string;
    email: string;
    role: string;
    xpTotal: number;
    nivel: number;
  };
  token: string;
};

/**
 * Registra um novo aluno na plataforma ISOMÉTRICA.
 *
 * @param data Dados de cadastro validados pelo Zod.
 * @returns Usuário criado e token JWT.
 * @throws AppError se o e-mail já estiver cadastrado.
 */
export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (userAlreadyExists) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const hashedPassword = await bcrypt.hash(data.senha, 10);

  const user = await prisma.user.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: hashedPassword,
    },
  });

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );

  return {
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      xpTotal: user.xpTotal,
      nivel: user.nivel,
    },
    token,
  };
}

/**
 * Autentica um usuário existente.
 *
 * @param data Credenciais de login validadas pelo Zod.
 * @returns Usuário autenticado e token JWT.
 * @throws AppError se o usuário não existir ou a senha estiver incorreta.
 */
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

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );

  return {
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      xpTotal: user.xpTotal,
      nivel: user.nivel,
    },
    token,
  };
}