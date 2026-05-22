-- CreateEnum
CREATE TYPE "StatusCurso" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "status" "StatusCurso" NOT NULL DEFAULT 'RASCUNHO';
