/*
  Warnings:

  - You are about to alter the column `to_get` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `to_give` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "to_get" SET DEFAULT 0,
ALTER COLUMN "to_get" SET DATA TYPE INTEGER,
ALTER COLUMN "to_give" SET DEFAULT 0,
ALTER COLUMN "to_give" SET DATA TYPE INTEGER;
