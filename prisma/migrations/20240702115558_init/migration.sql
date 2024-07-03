/*
  Warnings:

  - Added the required column `data` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL;
