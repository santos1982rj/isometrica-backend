import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3333),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
  FRONTEND_URL: process.env.FRONTEND_URL,
  PASSWORD_RESET_LINK_MODE: process.env.PASSWORD_RESET_LINK_MODE ?? 'development',
  MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  MERCADO_PAGO_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  API_BASE_URL: process.env.API_BASE_URL,
};
