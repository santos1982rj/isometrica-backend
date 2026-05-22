ALTER TABLE "transactions"
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "cursoId" TEXT,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "installments" INTEGER,
ADD COLUMN "statusDetail" TEXT;

CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON "transactions"("idempotencyKey");

ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_cursoId_fkey"
FOREIGN KEY ("cursoId") REFERENCES "courses"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
