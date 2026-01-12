-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "corrected" INTEGER,
ADD COLUMN     "correctedLabel" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "predicted" INTEGER,
ADD COLUMN     "predictedLabel" TEXT;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "predicted" INTEGER NOT NULL,
    "corrected" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
