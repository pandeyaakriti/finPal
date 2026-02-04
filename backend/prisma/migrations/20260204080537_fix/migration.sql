/*
  Warnings:

  - You are about to drop the column `usedForTraining` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_usedForTraining_idx";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "usedForTraining" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "usedForTraining";

-- CreateIndex
CREATE INDEX "Transactions_usedForTraining_idx" ON "Transactions"("usedForTraining");
