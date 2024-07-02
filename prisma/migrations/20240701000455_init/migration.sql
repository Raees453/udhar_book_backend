/*
  Warnings:

  - You are about to drop the column `fcmToken` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "fcmToken";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT;
