/*
  Warnings:

  - You are about to drop the column `password_changed_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone_verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_changed_at",
DROP COLUMN "phone_verified",
ADD COLUMN     "otpCreatedAt" TIMESTAMP(3),
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "phoneVerified" BOOLEAN DEFAULT false;
