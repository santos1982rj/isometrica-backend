import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';

import {
  createLessonAttachment,
  getLessonAttachments,
} from './uploads.service';

export async function uploadLessonAttachmentController(
  request: Request,
  response: Response,
) {
  const lessonId = request.params.lessonId;
  const actor = request.user;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  if (!request.file) {
    throw new AppError('Arquivo não enviado.', 400);
  }

  const attachment = await createLessonAttachment(
    actor,
    lessonId,
    request.file,
  );

  return response.status(201).json({
    attachment,
  });
}

export async function getLessonAttachmentsController(
  request: Request,
  response: Response,
) {
  const lessonId = request.params.lessonId;
  const actor = request.user;

  if (!actor) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  if (!lessonId || Array.isArray(lessonId)) {
    throw new AppError('ID da aula inválido.', 400);
  }

  const attachments = await getLessonAttachments(actor, lessonId);

  return response.status(200).json({
    attachments,
  });
}
