import { Router } from 'express';

import { upload } from '../../config/multer';

import { authMiddleware } from '../../core/middlewares/authMiddleware';

import {
  getLessonAttachmentsController,
  uploadLessonAttachmentController,
} from './uploads.controller';

const uploadsRoutes = Router();

/**
 * Upload de anexo da aula.
 */
uploadsRoutes.post(
  '/uploads/lessons/:lessonId/attachments',
  authMiddleware,
  upload.single('file'),
  uploadLessonAttachmentController,
);

/**
 * Listagem de anexos da aula.
 */
uploadsRoutes.get(
  '/lessons/:lessonId/attachments',
  authMiddleware,
  getLessonAttachmentsController,
);

export { uploadsRoutes };