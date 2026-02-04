/*
  Warnings:

  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usedForTraining" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Feedback";

-- CreateTable
CREATE TABLE "RetrainingJob" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCorrections" INTEGER NOT NULL,
    "trainSamples" INTEGER,
    "valSamples" INTEGER,
    "bestValAccuracy" DOUBLE PRECISION,
    "epochs" INTEGER NOT NULL DEFAULT 8,
    "learningRate" DOUBLE PRECISION NOT NULL DEFAULT 0.00002,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetrainingJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RetrainingJob_status_idx" ON "RetrainingJob"("status");

-- CreateIndex
CREATE INDEX "User_usedForTraining_idx" ON "User"("usedForTraining");
