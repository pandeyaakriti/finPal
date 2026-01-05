-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "remarks" TEXT,
    "amountPlus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountMinus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
