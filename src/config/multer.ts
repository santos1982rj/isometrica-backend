import path from 'node:path';

import multer from 'multer';

import crypto from 'node:crypto';

/**
 * Configuração central do Multer.
 *
 * Responsabilidades:
 * - definir destino dos uploads;
 * - evitar colisão de arquivos;
 * - controlar nomes;
 * - permitir futura evolução:
 *   - S3
 *   - Cloudinary
 *   - MinIO
 */
export const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(
      'uploads',
    ),

    filename(request, file, callback) {
      const hash = crypto.randomBytes(8).toString('hex');

      const filename = `${hash}-${file.originalname}`;

      callback(null, filename);
    },
  }),
});