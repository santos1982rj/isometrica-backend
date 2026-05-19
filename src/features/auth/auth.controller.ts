import { Request, Response } from 'express';

import { loginUser, registerUser } from './auth.service';

/**
 * Controller responsável pelo cadastro de novos usuários.
 *
 * @param request Requisição HTTP com nome, e-mail e senha.
 * @param response Resposta HTTP com usuário criado e token.
 */
export async function registerController(request: Request, response: Response) {
  const result = await registerUser(request.body);

  return response.status(201).json(result);
}

/**
 * Controller responsável pelo login de usuários.
 *
 * @param request Requisição HTTP com e-mail e senha.
 * @param response Resposta HTTP com usuário autenticado e token.
 */
export async function loginController(request: Request, response: Response) {
  const result = await loginUser(request.body);

  return response.status(200).json(result);
}