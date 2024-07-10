/*
  Warnings:

  - You are about to drop the column `reason` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `subTitle` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "reason",
DROP COLUMN "subject",
ADD COLUMN     "subTitle" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
