/*
  Warnings:

  - You are about to drop the column `onwerId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_onwerId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "onwerId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
