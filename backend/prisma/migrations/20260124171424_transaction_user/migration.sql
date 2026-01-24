/*
  Warnings:

  - Added the required column `userId` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'AI',
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "amountPlus" SET DEFAULT 0,
ALTER COLUMN "amountMinus" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Transactions_userId_idx" ON "Transactions"("userId");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
