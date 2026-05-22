import { prisma } from '../../config/prisma';

import { ensureLessonAccessByLessonId } from '../lessons/lesson-access.service';

import type { AuthUser } from '../auth/auth.types';

export async function createLessonAttachment(
  actor: AuthUser,
  lessonId: string,
  file: Express.Multer.File,
) {
  await ensureLessonAccessByLessonId(actor, lessonId);

  const attachment = await prisma.anexo.create({
    data: {
      nome: file.originalname,
      url: `/uploads/${file.filename}`,
      tipo: file.mimetype,
      tamanho: file.size,
      aulaId: lessonId,
    },
  });

  return attachment;
}

export async function getLessonAttachments(
  actor: AuthUser,
  lessonId: string,
) {
  await ensureLessonAccessByLessonId(actor, lessonId);

  return prisma.anexo.findMany({
    where: {
      aulaId: lessonId,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}
