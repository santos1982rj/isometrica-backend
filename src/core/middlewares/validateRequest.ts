import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateRequest(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        status: 'error',
        message: 'Dados inválidos.',
        errors: result.error.flatten().fieldErrors,
      });
    }

    request.body = result.data;
    return next();
  };
}