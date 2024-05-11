/*
  Warnings:

  - You are about to drop the column `profie` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profie",
ADD COLUMN     "profile" TEXT;
